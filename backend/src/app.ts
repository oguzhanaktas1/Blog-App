import express from "express"
import cors from "cors"
import postRoutes from "./routes/postRoutes"
import authRoutes from "./routes/authRoutes"
import adminRoutes from "./routes/admin";
import commentRoutes from "./routes/comment";
import profileRoutes from "./routes/profile";
import aiRoutes from "./routes/ai";
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/errorHandler";
import type { ErrorRequestHandler } from "express";
import postReactionsRoutes from "./routes/postReactionsRoutes";
import commentReactionsRoutes from "./routes/commentReactionsRoutes";
import notificationRoutes from './routes/notifications';

const app = express();

app.use(cors())
app.use(express.json())
app.use(bodyParser.json());

app.get("/test-log", (req, res) => {
  console.log("Test log çalıştı!");
  res.send("OK");
});

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api", profileRoutes);
app.use("/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/ai", aiRoutes);
app.use("/api/post-reactions", postReactionsRoutes);
app.use("/api/comment-reactions", commentReactionsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use(errorHandler as ErrorRequestHandler);

export default app;
