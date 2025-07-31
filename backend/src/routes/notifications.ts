import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getNotifications, deleteNotification, deleteAllNotifications } from "../controllers/notificationController";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.delete("/:id", authMiddleware, deleteNotification);
router.delete('/', authMiddleware, deleteAllNotifications);

export default router;
