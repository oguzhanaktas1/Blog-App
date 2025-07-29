import express from "express";
import {
  addPostReaction,
  removePostReaction,
  getPostReactions,
} from "../controllers/postReactionsController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { validatePostReaction } from "../middlewares/validatePostReaction";

const router = express.Router();

// GET /api/post-reactions/:postId
router.get("/:postId", getPostReactions);

// POST /api/post-reactions/:postId
router.post("/:postId", authenticateToken, validatePostReaction, addPostReaction);

// DELETE /api/post-reactions/:postId
router.delete("/:postId", authenticateToken, removePostReaction);

export default router;
