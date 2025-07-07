import express from "express";
import {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController";
import { validatePost } from "../middlewares/postValidation";

const router = express.Router();

router.post("/", validatePost, createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.put("/:id", validatePost, updatePost);
router.delete("/:id", deletePost);

export default router;
