import { Server } from "socket.io";
import { createServer } from "http";
import app from "./app";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST"],
  },
});

const connectedUsers = new Map<string, Set<string>>(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı:", socket.id);

  // Kullanıcıyı kaydet
  socket.on("register", (userId: string | number) => {
    const id = userId.toString();
    const existing = connectedUsers.get(id) || new Set();
    existing.add(socket.id);
    connectedUsers.set(id, existing);
  
    console.log(`${id} socket ${socket.id} ile bağlandı`);
  });
  

  socket.on("join_post", (postId: string) => {
    socket.join(postId);
    console.log(`Kullanıcı ${socket.id}, post-${postId} odasına katıldı.`);
  });

  socket.on("new_comment", (data) => {
    const { postId, comment } = data;
    io.to(postId).emit("receive_comment", comment);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketSet] of connectedUsers.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
  
        // Eğer artık hiç bağlantı kalmadıysa, map'ten tamamen sil
        if (socketSet.size === 0) {
          connectedUsers.delete(userId);
        } else {
          connectedUsers.set(userId, socketSet); // güncelle
        }
  
        break;
      }
    }
  
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
  
});

export { io, httpServer, connectedUsers };
