import express from "express";
import { getCommentsByPost, addComment, deleteComment } from "../controllers/commentController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { validateComment } from "../middlewares/commentValidation";

const router = express.Router();

// GET /posts/:postId/comments
router.get("/posts/:postId/comments", async (req, res) => {
  await getCommentsByPost(req, res);
});

// POST /posts/:postId/comments
router.post("/posts/:postId/comments", authenticateToken, validateComment, async (req, res) => {
  await addComment(req, res);
});

// DELETE /comments/:commentId
router.delete("/comments/:commentId", authenticateToken, async (req, res) => {
  await deleteComment(req, res);
});

export default router; 