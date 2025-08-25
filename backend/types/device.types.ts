import type { Socket } from "socket.io";

export type Device = {
  uniqueUsername: string; // for ux
  ip: string;
  brand: string;
  _uniqueRandomId: string; // used for qr code
  connectionCode: string; // 4-digit connection code
  socket: Socket;
};
