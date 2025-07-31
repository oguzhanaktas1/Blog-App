import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { extractMentions } from "../utils/mentionParser";
import { connectedUsers, io, onlineUsers } from "../socket";
import { notifyUser } from "../utils/notifyUser"; // notifyUser fonksiyonunu içe aktar

export const getCommentsByPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) {
    return next({ status: 400, message: "Geçersiz post ID" });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    type CommentWithAuthor = (typeof comments)[number];

    res.json(
      comments.map((c: CommentWithAuthor) => ({
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        author: c.author
          ? {
              id: c.author.id,
              name: c.author.name,
              email: c.author.email,
            }
          : null,
      }))
    );
  } catch (err) {
    next(err);
  }
};

export const addComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const postId = parseInt(req.params.postId);
  const userId = req.userId;
  const { text } = req.body;

  if (isNaN(postId)) {
    return next({ status: 400, message: "Geçersiz post ID" });
  }
  if (!userId) {
    return next({ status: 401, message: "Kimlik doğrulama gerekli" });
  }
  if (!text || text.trim() === "") {
    return next({ status: 400, message: "Yorum boş olamaz" });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        text,
        postId,
        authorId: userId,
      },
      include: {
        author: true, // yorumu yapan kullanıcı bilgisi
        post: {
          include: {
            author: true, // postun sahibi
          },
        },
      },
    });

    console.log(
      "addComment userId:",
      req.userId,
      "role:",
      req.userRole,
      "username:",
      newComment.author.username
    );

    // Mention işlemleri
    const mentionedUsernames = extractMentions(text);
    console.log("Mentions found:", mentionedUsernames);

    const mentionedUsers = await prisma.user.findMany({
      where: {
        username: {
          in: mentionedUsernames.map((name) => name.toLowerCase()),
          mode: "insensitive",
        },
      },
    });

    type MentionedUser = (typeof mentionedUsers)[number];

    // **Mentionlanan kullanıcılara bildirim gönder**
    for (const mentionedUser of mentionedUsers) {
      // Yorumu yapan kişi, mentionladığı kişiyi kendisi ise bildirim gönderme
      if (mentionedUser.id === userId) {
        continue;
      }

      const mentionNotificationMessage = `@${newComment.author.username} gönderinizdeki bir yorumda sizden bahsetti: "${text.substring(0, 50)}..."`; // Yorumun ilk 50 karakteri

      // Veritabanına kalıcı bildirim kaydet
      await notifyUser(
        mentionedUser.id,
        mentionNotificationMessage,
        {
          postId: postId,
          commentId: newComment.id,
          type: "mention", // Bildirim tipi: mention
          senderId: userId, // Yorumu yapan kullanıcı
        }
      );

      // Socket.io üzerinden anlık bildirim gönder (zaten vardı, mesajı güncelledik)
      // connectedUsers yerine onlineUsers kullanılıyor, bu daha doğru
      const mentionedUserSocketId = onlineUsers.get(String(mentionedUser.id));
      if (mentionedUserSocketId) {
        io.to(mentionedUserSocketId).emit("newNotification", { // 'mention' yerine 'newNotification' kullanılması daha tutarlı
          message: mentionNotificationMessage,
          postId: postId,
          commentId: newComment.id,
          type: "mention",
          senderId: userId,
        });
      }
    }

    // Post sahibine yorum yapıldığında bildirim gönder (mevcut mantık)
    const postOwnerId = newComment.post.authorId;

    if (postOwnerId !== userId) {
      const commentNotificationMessage = `${newComment.author.name} gönderine yorum yaptı.`;

      await notifyUser(
        postOwnerId,
        commentNotificationMessage,
        {
          postId: newComment.post.id,
          commentId: newComment.id,
          type: "comment", // Bildirim tipi: comment
          senderId: userId, // Yorumu yapan kullanıcı
        }
      );
    }

    res.status(201).json({
      id: newComment.id,
      text: newComment.text,
      createdAt: newComment.createdAt,
      postId: newComment.postId,
      author: newComment.author
        ? {
            id: newComment.author.id,
            name: newComment.author.name,
            email: newComment.author.email,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const commentId = parseInt(req.params.commentId);
  const userId = req.userId;
  const userRole = req.userRole;

  if (isNaN(commentId)) {
    return next({ status: 400, message: "Geçersiz yorum ID" });
  }
  if (!userId) {
    return next({ status: 401, message: "Kimlik doğrulama gerekli" });
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return next({ status: 404, message: "Yorum bulunamadı" });
    }

    const isOwner = comment.authorId === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return next({ status: 403, message: "Bu yorumu silmeye yetkiniz yok" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: "Yorum silindi" });
  } catch (err) {
    next(err);
  }
};