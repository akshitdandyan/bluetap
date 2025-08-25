import { Router } from "express";
import { uploadFileToMinio } from "../config/minio";
import deviceMesh from "../core/deviceMesh";

const router = Router();

router.post("/upload-file-and-send", async (req, res) => {
  try {
    const {
      fileName,
      file,
      mime,
      receiverDeviceUniqueRandomId,
      senderDeviceUniqueRandomId,
    } = req.body;
    const buffer = Buffer.from(file, "base64");

    // Calculate file size from buffer
    const fileSize = buffer.length;

    const { url } = await uploadFileToMinio(fileName, buffer);
    deviceMesh.sendFileToDevice(
      receiverDeviceUniqueRandomId,
      senderDeviceUniqueRandomId,
      fileName,
      mime,
      url,
      fileSize
    );
    res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log("Error uploading file to minio", error);
    res.status(200).json({ error: "Error uploading file to minio" });
  }
});

export default router;
