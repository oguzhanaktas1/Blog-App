import express from "express";
import {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  isPostLiked,
  getLikedPosts,
  uploadPostImage,
  deletePostImage,
} from "../controllers/postController";
import { validatePost } from "../middlewares/postValidation";
import { authenticateToken } from "../middlewares/authMiddleware";
import multer from "multer";


const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get("/", getAllPosts);
router.get("/liked", authenticateToken, getLikedPosts);
router.get("/:id", getPostById);
router.post("/", authenticateToken, validatePost, createPost);
router.put("/:id", authenticateToken, updatePost);
router.delete("/:id", authenticateToken, deletePost);
router.post("/:id/like", authenticateToken, likePost);
router.delete("/:id/like", authenticateToken, unlikePost);
router.get("/:id/like", authenticateToken, isPostLiked);
router.post("/:id/upload-image", authenticateToken, upload.array("images", 10), uploadPostImage);
router.delete("/postimages/:id", authenticateToken, deletePostImage);
export default router;
