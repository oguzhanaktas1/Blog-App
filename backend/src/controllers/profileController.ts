import { Request, Response } from "express";
import { prisma } from "../prisma/client"; // kendi prisma client yolunu kullan
import path from "path";

export const uploadProfilePhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const fileName = req.file.filename;
  const imageUrl = `/uploads/${fileName}`;
  const userId = Number(req.body.userId);

  if (!userId) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  // Kullanıcının profil fotoğrafını güncelle
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: imageUrl },
    });

    res.json({ imageUrl });
  } catch (error) {
    console.error("Profile photo upload error:", error); // <-- Hata detayını logla
    res.status(500).json({ error: "Database error", details: error });
  }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        role: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
    return;
  } catch (error) {
    res.status(500).json({ error: "Server error" });
    return;
  }
};
