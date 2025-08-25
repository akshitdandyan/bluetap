import Pair from "../models/pair.model";
import type { Device } from "../types/device.types";

class DeviceMesh {
  private deviceMesh;

  constructor() {
    this.deviceMesh = new Map<string, Device>();
  }

  getDevice(uniqueRandomId: string) {
    return this.deviceMesh.get(uniqueRandomId);
  }

  getDeviceMesh() {
    return this.deviceMesh;
  }

  validateQRCode(uniqueRandomId: string): boolean {
    return this.deviceMesh.has(uniqueRandomId);
  }

  addDevice(device: Device) {
    const uniqueRandomId = device._uniqueRandomId;

    const deviceUniqueUsername = device.uniqueUsername;

    // check if the ip is already in the mesh
    if (!this.deviceMesh.has(uniqueRandomId)) {
      this.deviceMesh.set(uniqueRandomId, device);
      // console.log(
      //   "New Ip and Device added to the mesh:",
      //   device.uniqueUsername,
      //   device.brand
      // );
      return;
    }

    // check if the device is already in the mesh
    if (this.deviceMesh.get(uniqueRandomId)) {
      console.log(
        "Device already in the mesh:",
        device.uniqueUsername,
        device.brand
      );
      return;
    }

    // add the device to the mesh to existing ip
    this.deviceMesh
      .get(uniqueRandomId)!
      .socket.emit("pairRequest", device.uniqueUsername);
    console.log(
      "Device added to the mesh:",
      device.uniqueUsername,
      device.brand
    );
  }

  removeDevice(device: Device) {
    const uniqueRandomId = device._uniqueRandomId;
    const deviceUniqueUsername = device.uniqueUsername;

    // check if the ip is in the mesh
    if (!this.deviceMesh.has(uniqueRandomId)) {
      console.log("Ip not in the mesh:", device.uniqueUsername, device.brand);
      return;
    }

    // check if the device is in the mesh
    if (!this.deviceMesh.get(uniqueRandomId)) {
      console.log(
        "Device not in the mesh:",
        device.uniqueUsername,
        device.brand
      );
      return;
    }

    // remove the device from the mesh
    this.deviceMesh.delete(uniqueRandomId);
    console.log(
      "Device removed from the mesh:",
      device.uniqueUsername,
      device.brand
    );
  }

  async sendPairedDevices(device: Device) {
    try {
      const pairedDevices = await Pair.find({
        $or: [
          { senderDeviceUniqueRandomId: device._uniqueRandomId },
          { receiverDeviceUniqueRandomId: device._uniqueRandomId },
        ],
      });

      // Get the actual device information for each paired device
      const pairedDevicesWithInfo = pairedDevices.map((pair) => {
        const otherDeviceId =
          pair.senderDeviceUniqueRandomId === device._uniqueRandomId
            ? pair.receiverDeviceUniqueRandomId
            : pair.senderDeviceUniqueRandomId;

        const otherDevice = this.deviceMesh.get(otherDeviceId);

        if (otherDevice) {
          // Device is online
          const isSender =
            pair.senderDeviceUniqueRandomId === device._uniqueRandomId;
          const nickname = isSender
            ? pair.receiverDeviceNickname
            : pair.senderDeviceNickname;

          return {
            _uniqueRandomId: otherDevice._uniqueRandomId,
            uniqueUsername: otherDevice.uniqueUsername,
            displayName: nickname || otherDevice.uniqueUsername, // Use nickname if available
            brand: otherDevice.brand,
            ip: otherDevice.ip,
            isOnline: true,
            hasCustomNickname: !!nickname,
          };
        } else {
          // Device is offline - get info from the pair document
          const isSender =
            pair.senderDeviceUniqueRandomId === device._uniqueRandomId;
          const storedUsername = isSender
            ? pair.receiverDeviceUsername
            : pair.senderDeviceUsername;
          const storedBrand = isSender
            ? pair.receiverDeviceBrand
            : pair.senderDeviceBrand;
          const nickname = isSender
            ? pair.receiverDeviceNickname
            : pair.senderDeviceNickname;

          return {
            _uniqueRandomId: otherDeviceId,
            uniqueUsername:
              storedUsername || `Device-${otherDeviceId.slice(-4)}`,
            displayName:
              nickname || storedUsername || `Device-${otherDeviceId.slice(-4)}`,
            brand: storedBrand || "Unknown",
            ip: "Offline",
            isOnline: false,
            hasCustomNickname: !!nickname,
          };
        }
      });

      device.socket.emit("PAIRED_DEVICES", pairedDevicesWithInfo);
      console.log(
        "Sent paired devices to",
        device.uniqueUsername,
        ":",
        pairedDevicesWithInfo
      );
    } catch (error) {
      console.log("Error sending paired devices", error);
    }
  }

  async sendPairRequest(
    senderDeviceUniqueRandomId: string,
    uniqueRandomId: string
  ) {
    const device = this.deviceMesh.get(uniqueRandomId);
    console.log("total devices in mesh", this.deviceMesh.size);
    if (!device) {
      console.log("Invalid QR code - device not found");
      const senderDevice = this.deviceMesh.get(senderDeviceUniqueRandomId);
      if (senderDevice) {
        senderDevice.socket.emit("PAIR_REQUEST_ERROR", {
          message: "Invalid QR code. Please scan a valid device QR code.",
          errorType: "INVALID_QR_CODE",
          senderDeviceUniqueRandomId: senderDevice._uniqueRandomId,
        });
      }
      return false;
    }
    const senderDevice = this.deviceMesh.get(senderDeviceUniqueRandomId);
    if (!senderDevice) {
      console.log("Sender device not found");
      return false;
    }

    // Check if user is trying to pair with themselves
    if (senderDeviceUniqueRandomId === uniqueRandomId) {
      console.log("User trying to pair with themselves");
      senderDevice.socket.emit("PAIR_REQUEST_ERROR", {
        message: "You cannot pair with your own device.",
        errorType: "SELF_PAIRING",
        senderDeviceUniqueRandomId: senderDevice._uniqueRandomId,
      });
      return false;
    }

    // Check if devices are already paired
    const existingPair = await Pair.findOne({
      $or: [
        {
          senderDeviceUniqueRandomId: senderDeviceUniqueRandomId,
          receiverDeviceUniqueRandomId: uniqueRandomId,
        },
        {
          senderDeviceUniqueRandomId: uniqueRandomId,
          receiverDeviceUniqueRandomId: senderDeviceUniqueRandomId,
        },
      ],
    });

    if (existingPair) {
      console.log("Devices are already paired");
      senderDevice.socket.emit("PAIR_REQUEST_ERROR", {
        message: "Devices are already paired.",
        errorType: "ALREADY_PAIRED",
        senderDeviceUniqueRandomId: senderDevice._uniqueRandomId,
      });
      return false;
    }

    // Send pair request to the target device
    device.socket.emit("PAIR_REQUEST", {
      senderUniqueRandomId: senderDeviceUniqueRandomId,
      senderUsername: senderDevice.uniqueUsername,
      senderBrand: senderDevice.brand,
    });

    return true;
  }

  async sendPairRequestByCode(
    senderDeviceUniqueRandomId: string,
    connectionCode: string
  ) {
    // Find device by connection code
    const device = Array.from(this.deviceMesh.values()).find(
      (d) => d.connectionCode === connectionCode
    );

    if (!device) {
      console.log("Invalid connection code - device not found");
      const senderDevice = this.deviceMesh.get(senderDeviceUniqueRandomId);
      if (senderDevice) {
        senderDevice.socket.emit("PAIR_REQUEST_ERROR", {
          message:
            "Invalid connection code. Please enter a valid 4-digit code.",
          errorType: "INVALID_CONNECTION_CODE",
          senderDeviceUniqueRandomId: senderDevice._uniqueRandomId,
        });
      }
      return false;
    }

    const senderDevice = this.deviceMesh.get(senderDeviceUniqueRandomId);
    if (!senderDevice) {
      console.log("Sender device not found");
      return false;
    }

    // Check if user is trying to pair with themselves
    if (senderDeviceUniqueRandomId === device._uniqueRandomId) {
      console.log("User trying to pair with themselves");
      senderDevice.socket.emit("PAIR_REQUEST_ERROR", {
        message: "You cannot pair with your own device.",
        errorType: "SELF_PAIRING",
        senderDeviceUniqueRandomId: senderDevice._uniqueRandomId,
      });
      return false;
    }

    // Check if devices are already paired
    const existingPair = await Pair.findOne({
      $or: [
        {
          senderDeviceUniqueRandomId: senderDeviceUniqueRandomId,
          receiverDeviceUniqueRandomId: device._uniqueRandomId,
        },
        {
          senderDeviceUniqueRandomId: device._uniqueRandomId,
          receiverDeviceUniqueRandomId: senderDeviceUniqueRandomId,
        },
      ],
    });

    if (existingPair) {
      console.log("Devices are already paired");
      senderDevice.socket.emit("PAIR_REQUEST_ERROR", {
        message: "Devices are already paired.",
        errorType: "ALREADY_PAIRED",
        senderDeviceUniqueRandomId: senderDevice._uniqueRandomId,
      });
      return false;
    }

    // Send pair request to the target device
    device.socket.emit("PAIR_REQUEST", {
      senderUniqueRandomId: senderDeviceUniqueRandomId,
      senderUsername: senderDevice.uniqueUsername,
      senderBrand: senderDevice.brand,
    });

    return true;
  }

  async sendPairRequestReply(
    senderDeviceUniqueRandomId: string,
    uniqueRandomId: string,
    isAccepted: boolean
  ) {
    const device = this.deviceMesh.get(uniqueRandomId);
    if (!device) {
      console.log("Device not found");
      return false;
    }
    const senderDevice = this.deviceMesh.get(senderDeviceUniqueRandomId);
    if (!senderDevice) {
      console.log("Sender device not found");
      return false;
    }

    // Send pair request reply to sender
    senderDevice.socket.emit("PAIR_REQUEST_REPLY", {
      isAccepted,
      uniqueRandomId,
      senderDeviceUniqueRandomId,
    });

    // If accepted, send nickname selection requests to both devices
    if (isAccepted) {
      // Send nickname selection request to sender (for receiver's nickname)
      senderDevice.socket.emit("NICKNAME_SELECTION_REQUEST", {
        targetDeviceId: uniqueRandomId,
        targetDeviceUsername: device.uniqueUsername,
        targetDeviceBrand: device.brand,
        isForReceiver: true, // Sender is setting nickname for receiver
      });

      // Send nickname selection request to receiver (for sender's nickname)
      device.socket.emit("NICKNAME_SELECTION_REQUEST", {
        targetDeviceId: senderDeviceUniqueRandomId,
        targetDeviceUsername: senderDevice.uniqueUsername,
        targetDeviceBrand: senderDevice.brand,
        isForReceiver: false, // Receiver is setting nickname for sender
      });

      // Refresh paired devices for both devices after sending nickname requests
      await this.sendPairedDevices(senderDevice);
      await this.sendPairedDevices(device);
    }

    return true;
  }

  async sendFileToDevice(
    receiverDeviceUniqueRandomId: string,
    senderDeviceUniqueRandomId: string,
    fileName: string,
    mime: string,
    url: string,
    fileSize: number
  ) {
    const senderDevice = this.deviceMesh.get(senderDeviceUniqueRandomId);
    if (!senderDevice) {
      console.log("Sender device not found");
      return false;
    }

    const receiverDevice = this.deviceMesh.get(receiverDeviceUniqueRandomId);
    if (!receiverDevice) {
      console.log("Receiver device not found");
      return false;
    }

    receiverDevice.socket.emit("NEW_FILE_RECEIVED", {
      fileName,
      url,
      mime,
      fileSize,
      senderDeviceUniqueRandomId,
      senderUsername: senderDevice.uniqueUsername,
    });
  }

  sendTextToDevice(
    receiverDeviceUniqueRandomId: string,
    senderDeviceUniqueRandomId: string,
    text: string,
    isLink: boolean
  ) {
    const senderDevice = this.deviceMesh.get(senderDeviceUniqueRandomId);
    if (!senderDevice) {
      console.log("Sender device not found");
      return false;
    }

    const receiverDevice = this.deviceMesh.get(receiverDeviceUniqueRandomId);
    if (!receiverDevice) {
      console.log("Receiver device not found");
      return false;
    }

    receiverDevice.socket.emit("NEW_TEXT_RECEIVED", {
      text,
      isLink,
      senderDeviceUniqueRandomId,
      senderUsername: senderDevice.uniqueUsername,
    });
  }
}

const deviceMesh = new DeviceMesh();

export default deviceMesh;
