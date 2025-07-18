/// <reference types="cors" />
import express from "express"
import cors from "cors"
import postRoutes from "./routes/postRoutes"
import authRoutes from "./routes/authRoutes"
import adminRoutes from "./routes/admin";
import commentRoutes from "./routes/comment";
import profileRoutes from "./routes/profile";

const app = express()

app.get("/test-log", (req, res) => {
  console.log("Test log çalıştı!");
  res.send("OK");
});

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes);
app.use("/posts", postRoutes)
app.use("/api", commentRoutes);
app.use("/api", profileRoutes);

app.use("/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));

export default app
