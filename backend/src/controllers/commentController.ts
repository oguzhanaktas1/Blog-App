import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import type { AuthRequest } from "../middlewares/authMiddleware";

export const getCommentsByPost = async (req: Request, res: Response, next: NextFunction) => {
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
      orderBy: { createdAt: "asc" },
    });
    res.json(
      comments.map((c) => ({
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

export const addComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log("addComment userId:", req.userId, "role:", req.userRole);
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
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.status(201).json({
      id: newComment.id,
      text: newComment.text,
      createdAt: newComment.createdAt,
      postId: newComment.postId, // include postId in response
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

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
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


