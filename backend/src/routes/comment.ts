import express from "express";
import { getCommentsByPost, addComment, deleteComment } from "../controllers/commentController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { validateComment } from "../middlewares/validateComment";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { Response, NextFunction } from "express";

const router = express.Router();

// GET /posts/:postId/comments
router.get("/posts/:postId/comments", async (req: AuthRequest, res: Response, next: NextFunction) => {
  await getCommentsByPost(req, res, next);
});

// POST /posts/:postId/comments
router.post("/posts/:postId/comments", authenticateToken, validateComment, async (req: AuthRequest, res: Response, next: NextFunction) => {
  await addComment(req, res, next);
});

// DELETE /comments/:commentId
router.delete("/comments/:commentId", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  await deleteComment(req, res, next);
});

router.post("/comments", addComment);

export default router; 