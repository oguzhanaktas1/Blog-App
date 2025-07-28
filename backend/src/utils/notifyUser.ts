import { io, connectedUsers } from "../socket";

export function notifyUser(userId: string, message: string) {
    const socketSet = connectedUsers.get(userId);
    if (!socketSet) return;
  
    for (const socketId of socketSet) {
      io.to(socketId).emit("receive_notification", message);
    }
  }
  
  