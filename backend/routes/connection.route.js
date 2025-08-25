import { Router } from "express";
import deviceMesh from "../core/deviceMesh";
import Pair from "../models/pair.model";

const connectionRouter = Router();

connectionRouter.post("/send-pair-request", async (req, res) => {
  try {
    const { uniqueRandomId, senderDeviceUniqueRandomId } = req.body;

    // Validate QR code first
    if (!deviceMesh.validateQRCode(uniqueRandomId)) {
      return res.status(400).json({
        requestSent: false,
      });
    }

    const requestSent = await deviceMesh.sendPairRequest(
      senderDeviceUniqueRandomId,
      uniqueRandomId
    );

    res.status(200).json({ requestSent });
  } catch (error) {
    console.log("[connectionRouter] Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

connectionRouter.post("/send-pair-request-by-code", async (req, res) => {
  try {
    const { connectionCode, senderDeviceUniqueRandomId } = req.body;

    // Validate connection code format
    if (
      !connectionCode ||
      connectionCode.length !== 4 ||
      !/^\d{4}$/.test(connectionCode)
    ) {
      return res.status(400).json({
        requestSent: false,
        message:
          "Invalid connection code format. Please enter a 4-digit number.",
      });
    }

    const requestSent = await deviceMesh.sendPairRequestByCode(
      senderDeviceUniqueRandomId,
      connectionCode
    );

    res.status(200).json({ requestSent });
  } catch (error) {
    console.log("[connectionRouter] Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

connectionRouter.post("/pair-request-reply", async (req, res) => {
  try {
    const { isAccepted, uniqueRandomId, senderDeviceUniqueRandomId } = req.body;

    if (isAccepted) {
      const senderDevice = deviceMesh.getDevice(senderDeviceUniqueRandomId);
      const receiverDevice = deviceMesh.getDevice(uniqueRandomId);

      await Pair.create({
        senderDeviceUniqueRandomId,
        receiverDeviceUniqueRandomId: uniqueRandomId,
        senderDeviceUsername: senderDevice?.uniqueUsername || "Unknown",
        receiverDeviceUsername: receiverDevice?.uniqueUsername || "Unknown",
        senderDeviceBrand: senderDevice?.brand || "Unknown",
        receiverDeviceBrand: receiverDevice?.brand || "Unknown",
      });

      // Refresh paired devices for both devices after creating the pair
      if (senderDevice) {
        await deviceMesh.sendPairedDevices(senderDevice);
      }
      if (receiverDevice) {
        await deviceMesh.sendPairedDevices(receiverDevice);
      }
    }

    await deviceMesh.sendPairRequestReply(
      senderDeviceUniqueRandomId,
      uniqueRandomId,
      isAccepted
    );

    res.status(200).json({ message: "Pair request replied" });
  } catch (error) {
    console.log("[connectionRouter] Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

connectionRouter.post("/update-device-nickname", async (req, res) => {
  try {
    const {
      senderDeviceUniqueRandomId,
      receiverDeviceUniqueRandomId,
      nickname,
      updatedBy,
    } = req.body;

    // Find the pair relationship
    const pair = await Pair.findOne({
      $or: [
        {
          senderDeviceUniqueRandomId: senderDeviceUniqueRandomId,
          receiverDeviceUniqueRandomId: receiverDeviceUniqueRandomId,
        },
        {
          senderDeviceUniqueRandomId: receiverDeviceUniqueRandomId,
          receiverDeviceUniqueRandomId: senderDeviceUniqueRandomId,
        },
      ],
    });

    if (!pair) {
      return res.status(404).json({
        success: false,
        message: "Pair relationship not found",
      });
    }

    // Update the nickname based on who is updating it
    if (updatedBy === senderDeviceUniqueRandomId) {
      // Sender is updating receiver's nickname
      pair.receiverDeviceNickname = nickname;
    } else {
      // Receiver is updating sender's nickname
      pair.senderDeviceNickname = nickname;
    }

    await pair.save();

    // Only notify the device that made the change (no need to notify the other device)
    const updatingDevice = deviceMesh.getDevice(updatedBy);
    if (updatingDevice) {
      // Refresh paired devices only for the device that made the change
      await deviceMesh.sendPairedDevices(updatingDevice);
    }

    res.status(200).json({
      success: true,
      message: "Nickname updated successfully",
    });
  } catch (error) {
    console.log("[connectionRouter] Error updating nickname:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default connectionRouter;
