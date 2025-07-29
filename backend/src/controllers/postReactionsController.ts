import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import type { AuthRequest } from "../middlewares/authMiddleware";

export const addPostReaction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    const postId = parseInt(req.params.postId);
    const { reaction: type } = req.body;

    if (!userId || isNaN(postId)) {
      res.status(400).json({ message: "Geçersiz kullanıcı veya gönderi bilgisi." });
      return;
    }

    const existing = await prisma.reaction.findFirst({
      where: {
        userId,
        postId,
        commentId: null,
      },
    });

    // Eğer aynı tepki varsa, sil => toggle
    if (existing) {
      if (existing.type === type) {
        await prisma.reaction.delete({
          where: { id: existing.id },
        });
        res.status(200).json({ message: "Tepki kaldırıldı.", reaction: null });
        return;
      } else {
        const updated = await prisma.reaction.update({
          where: { id: existing.id },
          data: { type },
        });
        res.status(200).json({ message: "Tepki güncellendi.", reaction: updated });
        return;
      }
    }

    // Yeni tepki oluştur
    const newReaction = await prisma.reaction.create({
      data: {
        userId,
        postId,
        type,
      },
    });

    res.status(201).json({ message: "Tepki eklendi.", reaction: newReaction });
  } catch (error) {
    next(error);
  }
};

export const removePostReaction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    const postId = parseInt(req.params.postId);

    if (!userId || isNaN(postId)) {
      res.status(400).json({ message: "Geçersiz kullanıcı veya gönderi bilgisi." });
      return;
    }

    const deleted = await prisma.reaction.deleteMany({
      where: {
        userId,
        postId,
        commentId: null,
      },
    });

    if (deleted.count === 0) {
      res.status(404).json({ message: "Tepki bulunamadı." });
      return;
    }

    res.status(200).json({ message: "Tepki silindi." });
  } catch (error) {
    next(error);
  }
};

export const getPostReactions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.userId;

    if (isNaN(postId)) {
      res.status(400).json({ message: "Geçersiz gönderi ID." });
      return;
    }

    const grouped = await prisma.reaction.groupBy({
      by: ["type"],
      where: { postId, commentId: null },
      _count: true,
    });

    const userReaction = userId
      ? await prisma.reaction.findFirst({
          where: { postId, userId, commentId: null },
        })
      : null;

    res.status(200).json({
      reactions: grouped.map((g) => ({
        type: g.type,
        count: g._count,
        isReactedByCurrentUser: userReaction?.type === g.type,
      })),
      userReaction: userReaction?.type || null,
    });
  } catch (error) {
    next(error);
  }
};