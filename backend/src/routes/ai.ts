// src/routes/ai.ts
import express from "express";
import { generateBlogPost } from "../controllers/aiControllers";

const router = express.Router();

router.post("/generate", generateBlogPost);

export default router;
