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
import getUniqueRandomId from "../helpers/getUniqueRandomId";

function setupSocketAndServer(expressApp: Express) {
  const server = http.createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    const device = {
      uniqueUsername: uniqueUsernameGenerator({
        dictionaries: [adjectives, nouns],
      }),
      ip: socket.handshake.query.ip as string,
      brand: socket.handshake.query.brand as string,
      _uniqueRandomId: getUniqueRandomId(),
    };

    deviceMesh.addDevice(device);

    qrcode.toDataURL(device._uniqueRandomId).then((qrCodeImageUrl) => {
      socket.emit("qrCodeImageUrl", qrCodeImageUrl);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
      deviceMesh.removeDevice(device);
    });
  });

  return { io, server };
}

export default setupSocketAndServer;
