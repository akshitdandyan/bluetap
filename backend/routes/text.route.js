import { Router } from "express";
import deviceMesh from "../core/deviceMesh";

const router = Router();

router.post("/send-text", async (req, res) => {
  try {
    const {
      text,
      receiverDeviceUniqueRandomId,
      senderDeviceUniqueRandomId,
      isLink,
    } = req.body;

    deviceMesh.sendTextToDevice(
      receiverDeviceUniqueRandomId,
      senderDeviceUniqueRandomId,
      text,
      isLink
    );

    res.status(200).json({ message: "Text sent successfully" });
  } catch (error) {
    console.log("Error sending text", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
