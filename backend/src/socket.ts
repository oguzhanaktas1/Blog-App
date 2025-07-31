import { Server } from "socket.io";
import { createServer } from "http";
import app from "./app";
import { prisma } from "./prisma/client";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

export const onlineUsers = new Map<string, string>();
const connectedUsers = new Map<string, Set<string>>();
const socketToPostMap = new Map<string, string>(); // socket.id -> postId

io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı:", socket.id);

  socket.on("user-online", (userId: number) => {
    onlineUsers.set(String(userId), socket.id);
  });

  socket.on("register", (userId: string | number) => {
    console.log("Kayıt olan userId:", userId);
    const id = userId.toString();
    const existing = connectedUsers.get(id) || new Set();
    existing.add(socket.id);
    connectedUsers.set(id, existing);
    console.log("Tüm bağlı kullanıcılar:", connectedUsers);

    console.log(`${id} socket ${socket.id} ile bağlandı`);
  });

  socket.on("join_post", (postId: string) => {
    socket.join(postId);
    socketToPostMap.set(socket.id, postId);

    console.log(`Kullanıcı ${socket.id}, post-${postId} odasına katıldı.`);

    sendViewerCount(postId);
  });

  socket.on("leave_post", (postId: string) => {
    socket.leave(postId);
    socketToPostMap.delete(socket.id);

    console.log(`Kullanıcı ${socket.id}, post-${postId} odasından ayrıldı.`);

    sendViewerCount(postId);
  });

  socket.on("disconnect", () => {
    const postId = socketToPostMap.get(socket.id);
    if (postId) {
      socket.leave(postId);
      socketToPostMap.delete(socket.id);

      sendViewerCount(postId);
      console.log(`Kullanıcı ${socket.id}, post-${postId} odasından ayrıldı (disconnect).`);
    }

    for (const [userId, socketSet] of connectedUsers.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          connectedUsers.delete(userId);
        } else {
          connectedUsers.set(userId, socketSet);
        }
        break;
      }
    }

    console.log("Kullanıcı ayrıldı:", socket.id);
  });

  socket.on("new_comment", async ({ postId, comment }) => {
    io.to(postId).emit("receive_comment", comment);
  
    if (!comment || !comment.content) return;
  
    const mentionMatch = comment.content.match(/@(\w+)/);
    if (!mentionMatch) return;
  
    const mentionedUsername = mentionMatch[1];
  
    try {
      const mentionedUser = await prisma.user.findUnique({
        where: { username: mentionedUsername },
      });
  
      if (mentionedUser) {
        const socketSet = connectedUsers.get(mentionedUser.id.toString());
        if (socketSet) {
          for (const socketId of socketSet) {
            io.to(socketId).emit("mention", {
              message: `${comment.author.name} seni bir yorumda etiketledi.`,
              postId,
            });
          }
        }
      }
    } catch (err) {
      console.error("Mention kontrolü hatası:", err);
    }
  });
  
  

  socket.on("react-to-post", async ({ postId, userId, type }) => {
    try {
      const existing = await prisma.reaction.findFirst({
        where: { postId, userId, type },
      });

      if (existing) {
        await prisma.reaction.delete({ where: { id: existing.id } });
      } else {
        await prisma.reaction.create({
          data: { postId, userId, type },
        });
      }

      const reactions = await prisma.reaction.groupBy({
        by: ["type"],
        where: { postId },
        _count: true,
      });

      io.emit("post-reaction-update", { postId, reactions });
    } catch (error) {
      console.error("Reaction error:", error);
    }
  });

  socket.on("react-to-comment", async ({ commentId, userId, type }) => {
    try {
      const existing = await prisma.reaction.findFirst({
        where: { commentId, userId, type },
      });

      if (existing) {
        await prisma.reaction.delete({ where: { id: existing.id } });
      } else {
        await prisma.reaction.create({
          data: { commentId, userId, type },
        });
      }

      const reactions = await prisma.reaction.groupBy({
        by: ["type"],
        where: { commentId },
        _count: true,
      });

      io.emit("comment-reaction-update", { commentId, reactions });
    } catch (error) {
      console.error("Comment reaction error:", error);
    }
  });
});

function sendViewerCount(postId: string) {
  const viewerCount = io.sockets.adapter.rooms.get(postId)?.size || 0;
  io.to(postId).emit("viewer_count", viewerCount);
}

export { io, httpServer, connectedUsers };
