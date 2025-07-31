import { prisma } from "../prisma/client";
import { io, onlineUsers } from "../socket";

interface NotificationData {
  postId?: number;
  commentId?: number;
  type: string;
  senderId: number;
}

export const notifyUser = async (
  receiverId: number,
  message: string,
  data?: NotificationData
) => {
  try {
    if (!data || data.senderId === undefined) {
      console.error("Error: senderId is missing for notification creation.");
      return;
    }

    const newNotification = await prisma.notification.create({
      data: {
        receiverId: receiverId,
        message: message,
        type: data.type || "general",
        postId: data.postId,
        commentId: data.commentId,
        senderId: data.senderId,
        read: false,
      },
    });

    const receiverSocketId = onlineUsers.get(String(receiverId));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", {
        id: newNotification.id,
        message: newNotification.message,
        createdAt: newNotification.createdAt,
        type: newNotification.type,
        postId: newNotification.postId,
        commentId: newNotification.commentId,
        senderId: newNotification.senderId,
        read: newNotification.read,
      });
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};