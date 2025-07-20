import type { Device } from "../types/device.types";

class DeviceMesh {
  private deviceMesh;

  constructor() {
    this.deviceMesh = new Map<string, Record<string, Device>>();
  }

  addDevice(device: Device) {
    const deviceIp = device.ip;
    const deviceUniqueUsername = device.uniqueUsername;

    // check if the ip is already in the mesh
    if (!this.deviceMesh.has(deviceIp)) {
      this.deviceMesh.set(deviceIp, { [deviceUniqueUsername]: device });
      console.log(
        "New Ip and Device added to the mesh:",
        device.uniqueUsername,
        device.brand
      );
      return;
    }

    // check if the device is already in the mesh
    if (this.deviceMesh.get(deviceIp)?.[deviceUniqueUsername]) {
      console.log(
        "Device already in the mesh:",
        device.uniqueUsername,
        device.brand
      );
      return;
    }

    // add the device to the mesh to existing ip
    this.deviceMesh.get(deviceIp)![deviceUniqueUsername] = device;
    console.log(
      "Device added to the mesh:",
      device.uniqueUsername,
      device.brand
    );
  }

  removeDevice(device: Device) {
    const deviceIp = device.ip;
    const deviceUniqueUsername = device.uniqueUsername;

    // check if the ip is in the mesh
    if (!this.deviceMesh.has(deviceIp)) {
      console.log("Ip not in the mesh:", device.uniqueUsername, device.brand);
      return;
    }

    // check if the device is in the mesh
    if (!this.deviceMesh.get(deviceIp)?.[deviceUniqueUsername]) {
      console.log(
        "Device not in the mesh:",
        device.uniqueUsername,
        device.brand
      );
      return;
    }

    // remove the device from the mesh
    delete this.deviceMesh.get(deviceIp)![deviceUniqueUsername];
    console.log(
      "Device removed from the mesh:",
      device.uniqueUsername,
      device.brand
    );
  }
}

const deviceMesh = new DeviceMesh();

export default deviceMesh;
