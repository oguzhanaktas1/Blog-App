/// <reference types="cors" />
import express from "express"
import cors from "cors"
import postRoutes from "./routes/postRoutes"
import authRoutes from "./routes/authRoutes"
import adminRoutes from "./routes/admin";

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes);
app.use("/posts", postRoutes)

app.use("/admin", adminRoutes);

export default app
