import express from "express";
import {
  addCommentReaction,
  removeCommentReaction,
  getCommentReactions,
} from "../controllers/commentReactionsController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { validateCommentReaction } from "../middlewares/validateCommentReaction";

const router = express.Router();

// GET /api/comment-reactions/:commentId
router.get("/:commentId", getCommentReactions);

// POST /api/comment-reactions/:commentId
router.post("/:commentId", authenticateToken, validateCommentReaction, addCommentReaction);

// DELETE /api/comment-reactions/:commentId
router.delete("/:commentId", authenticateToken, removeCommentReaction);

export default router;
