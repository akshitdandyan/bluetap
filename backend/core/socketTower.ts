import { Server } from "socket.io";
import http from "http";
import type { Express } from "express";
import {
  adjectives,
  uniqueUsernameGenerator,
  nouns,
} from "unique-username-generator";
import qrcode from "qrcode";
import deviceMesh from "./deviceMesh";
import getUniqueRandomId, {
  getUnique4DigitCode,
} from "../helpers/getUniqueRandomId";
import Pair from "../models/pair.model";

function setupSocketAndServer(expressApp: Express) {
  const server = http.createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    // console.log("A user connected");

    const existingUniqueRandomId = socket.handshake.query
      ._uniqueRandomId as string;
    const alreadyHasUniqueRandomId =
      existingUniqueRandomId && existingUniqueRandomId !== "";

    const device = {
      uniqueUsername: uniqueUsernameGenerator({
        dictionaries: [adjectives, nouns],
      }),
      ip: socket.handshake.query.ip as string,
      brand: socket.handshake.query.brand as string,
      _uniqueRandomId: alreadyHasUniqueRandomId
        ? existingUniqueRandomId
        : getUniqueRandomId(),
      connectionCode: getUnique4DigitCode(),
      socket,
    };

    deviceMesh.sendPairedDevices(device);

    deviceMesh.addDevice(device);
    socket.emit("DEVICE_CONNECTED", {
      uniqueRandomId: device._uniqueRandomId,
      username: device.uniqueUsername,
      connectionCode: device.connectionCode,
    });

    // Generate QR code with URL instead of just the token
    const qrCodeData = `${
      process.env.VITE_FRONTEND_URL || "http://localhost:5173"
    }/pair-with/${device._uniqueRandomId}`;
    qrcode.toDataURL(qrCodeData).then((qrCodeImageUrl) => {
      socket.emit("QR_CODE_IMAGE_URL", qrCodeImageUrl);
    });

    socket.on("disconnect", () => {
      // console.log("A user disconnected");
      deviceMesh.removeDevice(device);
    });
  });

  return { io, server };
}

export default setupSocketAndServer;
