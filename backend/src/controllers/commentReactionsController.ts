import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import type { AuthRequest } from "../middlewares/authMiddleware";

export const addCommentReaction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    const commentId = parseInt(req.params.commentId);
    const { reaction: type } = req.body;

    if (!userId || isNaN(commentId)) {
      res.status(400).json({ message: "Geçersiz kullanıcı veya yorum bilgisi." });
      return;
    }

    const existing = await prisma.reaction.findFirst({
      where: {
        userId,
        commentId,
        postId: null,
      },
    });

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

    const newReaction = await prisma.reaction.create({
      data: {
        userId,
        commentId,
        type,
      },
    });

    res.status(201).json({ message: "Tepki eklendi.", reaction: newReaction });
  } catch (error) {
    next(error);
  }
};

export const removeCommentReaction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    const commentId = parseInt(req.params.commentId);

    if (!userId || isNaN(commentId)) {
      res.status(400).json({ message: "Geçersiz kullanıcı veya yorum bilgisi." });
      return;
    }

    const deleted = await prisma.reaction.deleteMany({
      where: {
        userId,
        commentId,
        postId: null,
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

export const getCommentReactions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const commentId = parseInt(req.params.commentId);
    const userId = req.userId;

    if (isNaN(commentId)) {
      res.status(400).json({ message: "Geçersiz yorum ID." });
      return;
    }

    const grouped = await prisma.reaction.groupBy({
      by: ["type"],
      where: { commentId, postId: null },
      _count: true,
    });

    const userReaction = userId
      ? await prisma.reaction.findFirst({
          where: { commentId, userId, postId: null },
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
