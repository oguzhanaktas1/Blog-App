import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import type { AuthRequest } from "../middlewares/authMiddleware";

export const getCommentsByPost = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) {
    return res.status(400).json({ error: "Geçersiz post ID" });
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
    console.error("Yorumlar alınamadı:", err);
    res.status(500).json({ error: "Yorumlar alınamadı" });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  const postId = parseInt(req.params.postId);
  const userId = req.userId;
  const { text } = req.body;
  if (isNaN(postId)) {
    return res.status(400).json({ error: "Geçersiz post ID" });
  }
  if (!userId) {
    return res.status(401).json({ error: "Kimlik doğrulama gerekli" });
  }
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Yorum boş olamaz" });
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
      author: newComment.author
        ? {
            id: newComment.author.id,
            name: newComment.author.name,
            email: newComment.author.email,
          }
        : null,
    });
  } catch (err) {
    console.error("Yorum oluşturulamadı:", err);
    res.status(500).json({ error: "Yorum oluşturulamadı" });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const commentId = parseInt(req.params.commentId);
  const userId = req.userId;
  const userRole = req.userRole;
  if (isNaN(commentId)) {
    return res.status(400).json({ error: "Geçersiz yorum ID" });
  }
  if (!userId) {
    return res.status(401).json({ error: "Kimlik doğrulama gerekli" });
  }
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      return res.status(404).json({ error: "Yorum bulunamadı" });
    }
    const isOwner = comment.authorId === userId;
    const isAdmin = userRole === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Bu yorumu silmeye yetkiniz yok" });
    }
    await prisma.comment.delete({
      where: { id: commentId },
    });
    res.json({ message: "Yorum silindi" });
  } catch (err) {
    console.error("Yorum silinemedi:", err);
    res.status(500).json({ error: "Yorum silinemedi" });
  }
}; 