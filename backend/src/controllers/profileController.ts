import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";

export const uploadProfilePhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.file) {
    return next({ status: 400, message: "No file uploaded" });
  }

  const fileName = req.file.filename;
  const imageUrl = `/uploads/${fileName}`;
  const userId = Number(req.body.userId);

  if (!userId) {
    return next({ status: 400, message: "User ID is required" });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: imageUrl },
    });
    res.json({ imageUrl });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next({ status: 401, message: "Unauthorized" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        profilePhoto: true,
        role: true,
      },
    });
    if (!user) {
      return next({ status: 404, message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
