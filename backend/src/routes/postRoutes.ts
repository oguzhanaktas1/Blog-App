import express from "express";
import {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController";
import { validatePost } from "../middlewares/postValidation";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// Async handler utility
type AsyncHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>;
const asyncHandler = (fn: AsyncHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/", authenticateToken, validatePost, asyncHandler(createPost));
router.get("/", asyncHandler(getAllPosts));
router.get("/:id", asyncHandler(getPostById));
router.put("/:id", validatePost, asyncHandler(updatePost));
router.delete("/:id", asyncHandler(deletePost));

export default router;
