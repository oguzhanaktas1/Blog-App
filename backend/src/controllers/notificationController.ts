import { Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      const error = new Error("Unauthorized: User not authenticated");
      (error as any).status = 401;
      return next(error);
    }

    const notifs = await prisma.notification.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
    });
    console.log("Fetched notifications:", notifs);
    res.json(notifs);
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      const error = new Error("Unauthorized: User not authenticated");
      (error as any).status = 401;
      return next(error);
    }

    const id = Number(req.params.id);
    if (isNaN(id)) {
      const error = new Error("Invalid notification id");
      (error as any).status = 400;
      return next(error);
    }

    const notif = await prisma.notification.findFirst({
      where: { id, receiverId: userId },
    });
    
    if (!notif) {
      const error = new Error("Notification not found");
      (error as any).status = 404;
      return next(error);
    }

    if (notif.receiverId !== userId) {
      const error = new Error("Forbidden: You cannot delete this notification");
      (error as any).status = 403;
      return next(error);
    }

    await prisma.notification.delete({ where: { id } });
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteAllNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      const error = new Error("Unauthorized: User not authenticated");
      (error as any).status = 401;
      return next(error);
    }

    // Use prisma.notification.deleteMany to delete all notifications
    // where the receiverId matches the authenticated userId.
    const deleteResult = await prisma.notification.deleteMany({
      where: { receiverId: userId },
    });

    // You can optionally return the count of deleted records
    res.json({ message: `All notifications (${deleteResult.count}) deleted successfully` });
  } catch (error) {
    next(error);
  }
};