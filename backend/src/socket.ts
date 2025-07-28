import { Server } from "socket.io";
import { createServer } from "http";
import app from "./app";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Kullanıcı socketleri (userId -> Set<socket.id>)
const connectedUsers = new Map<string, Set<string>>();

// Socket ID'yi hangi postId odasında tuttuğumuzu izlemek için:
const socketToPostMap = new Map<string, string>(); // socket.id -> postId

io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı:", socket.id);

  socket.on("register", (userId: string | number) => {
    const id = userId.toString();
    const existing = connectedUsers.get(id) || new Set();
    existing.add(socket.id);
    connectedUsers.set(id, existing);

    console.log(`${id} socket ${socket.id} ile bağlandı`);
  });

  socket.on("join_post", (postId: string) => {
    socket.join(postId);
    socketToPostMap.set(socket.id, postId); // takibe al

    console.log(`Kullanıcı ${socket.id}, post-${postId} odasına katıldı.`);

    const viewerCount = io.sockets.adapter.rooms.get(postId)?.size || 0;
    io.to(postId).emit("viewer_count", viewerCount);
  });

  socket.on("leave_post", (postId: string) => {
    socket.leave(postId);
    socketToPostMap.delete(socket.id);

    console.log(`Kullanıcı ${socket.id}, post-${postId} odasından ayrıldı.`);

    const viewerCount = io.sockets.adapter.rooms.get(postId)?.size || 0;
    io.to(postId).emit("viewer_count", viewerCount);
  });

  socket.on("new_comment", (data) => {
    const { postId, comment } = data;
    io.to(postId).emit("receive_comment", comment);
  });

  socket.on("disconnect", () => {
    const postId = socketToPostMap.get(socket.id);
    if (postId) {
      socket.leave(postId);
      socketToPostMap.delete(socket.id);

      const viewerCount = io.sockets.adapter.rooms.get(postId)?.size || 0;
      io.to(postId).emit("viewer_count", viewerCount);

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
});

export { io, httpServer, connectedUsers };
