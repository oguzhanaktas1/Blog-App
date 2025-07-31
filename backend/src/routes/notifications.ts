import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getNotifications, deleteNotification } from "../controllers/notificationController";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
