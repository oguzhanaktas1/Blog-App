import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { io, onlineUsers } from "../socket";

export const addCommentReaction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    const commentId = parseInt(req.params.commentId);
    const { reaction: type } = req.body;

    if (!userId || isNaN(commentId)) {
      res.status(400).json({ message: "Geçersiz kullanıcı veya yorum bilgisi." });
      return;
    }

    // Yorumu ve yorumun yazarını bul
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true, post: true }, // Yazar ve post bilgilerini de dahil et
    });

    if (!comment) {
      res.status(404).json({ message: "Yorum bulunamadı." });
      return;
    }

    const existing = await prisma.reaction.findFirst({
      where: {
        userId,
        commentId,
        postId: null,
      },
    });

    let notificationMessage: string = "";
    let reactionStatus: "added" | "updated" | "removed";

    if (existing) {
      if (existing.type === type) {
        // Aynı tepki varsa, sil
        await prisma.reaction.delete({
          where: { id: existing.id },
        });
        notificationMessage = `${req.user?.name} yorumunuzdaki tepkisini kaldırdı.`;
        reactionStatus = "removed";
        res.status(200).json({ message: "Tepki kaldırıldı.", reaction: null });
      } else {
        // Farklı tepki varsa, güncelle
        const updated = await prisma.reaction.update({
          where: { id: existing.id },
          data: { type },
        });
        notificationMessage = `${req.user?.name} yorumunuzdaki tepkisini ${type} olarak güncelledi.`;
        reactionStatus = "updated";
        res.status(200).json({ message: "Tepki güncellendi.", reaction: updated });
      }
    } else {
      // Yeni tepki oluştur
      const newReaction = await prisma.reaction.create({
        data: {
          userId,
          commentId,
          type,
        },
      });
      notificationMessage = `${req.user?.name} yorumunuza ${type} tepkisi verdi.`;
      reactionStatus = "added";
      res.status(201).json({ message: "Tepki eklendi.", reaction: newReaction });
    }

    // Yorumun sahibine bildirim gönder (kendi yorumuna tepki vermiyorsa)
    if (comment.authorId !== userId) {
      // Veritabanına bildirim kaydet
      await prisma.notification.create({
        data: {
          type: "comment_reaction",
          message: notificationMessage,
          commentId: commentId,
          postId: comment.postId,
          receiverId: comment.authorId,
          senderId: userId,
          read: false,
        },
      });

      // Yorumun sahibi online ise Socket.io üzerinden anlık bildirim gönder
      const commentOwnerSocketId = onlineUsers.get(String(comment.authorId));
      if (commentOwnerSocketId) {
        io.to(commentOwnerSocketId).emit("newNotification", {
          message: notificationMessage,
          commentId: commentId,
          postId: comment.postId,
          type: "comment_reaction",
          reactionStatus: reactionStatus,
        });
      }
    }
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

    // Tepki kaldırıldığında bildirim göndermiyoruz, sadece ekleme/güncelleme
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
      reactions: grouped.map((g: { type: any; _count: any; }) => ({
        type: g.type,
        count: g._count,
        isReactedByCurrentUser: userReaction?.type === g.type,
      })) || [],
      userReaction: userReaction?.type || null,
    });
  } catch (error) {
    next(error);
  }
};