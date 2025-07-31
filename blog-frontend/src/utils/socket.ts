import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export function setUserOnline(userId: number) {
  socket.emit("user-online", userId);
}

export default socket;
