/// <reference types="cors" />
import express from "express"
import cors from "cors"
import { Server } from "socket.io";
import { createServer } from "http";
import postRoutes from "./routes/postRoutes"
import authRoutes from "./routes/authRoutes"
import adminRoutes from "./routes/admin";
import commentRoutes from "./routes/comment";
import profileRoutes from "./routes/profile";
import aiRoutes from "./routes/ai";
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/errorHandler";
import type { ErrorRequestHandler } from "express";

const app = express()
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket bağlantısı
io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı:", socket.id);

  socket.on("join_post", (postId: string) => {
    socket.join(postId);
    console.log(`Kullanıcı ${socket.id}, post-${postId} odasına katıldı.`);
  });

  socket.on("new_comment", (data) => {
    const { postId, comment } = data;
    io.to(postId).emit("receive_comment", comment);
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Server 3000 portunda çalışıyor");
});

app.get("/test-log", (req, res) => {
  console.log("Test log çalıştı!");
  res.send("OK");
});

app.use(cors())
app.use(express.json())
app.use(bodyParser.json());
app.use("/auth", authRoutes);
app.use("/posts", postRoutes)
app.use("/api", commentRoutes);
app.use("/api", profileRoutes);

app.use("/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/ai", aiRoutes);

app.use(errorHandler as ErrorRequestHandler);

export default app
