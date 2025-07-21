import express from "express";
import { uploadProfilePhoto } from "../controllers/profileController";
import { authenticateToken } from "../middlewares/authMiddleware";
import multer from "multer";
import { getProfile } from "../controllers/profileController";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload-profile-photo",
  authenticateToken,
  upload.single("photo"),
  uploadProfilePhoto
);

router.get(
  "/profile",
  authenticateToken,
  getProfile
);

export default router;