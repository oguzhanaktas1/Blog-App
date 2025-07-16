import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({
      where: { id },
      include: {   // <-- burada author bilgisini ekle
        author: {
          select: {
            name: true,
            email: true, // istersen sadece name de olabilir
          },
        },
      },
    });
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};


export const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // artık req.userId'yi tanıyor olacak TS
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { title, content } = req.body;
    const authorId = req.userId!;
    const newPost = await prisma.post.create({
      data: { title, content, authorId },
    });
    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body;

    const post = await prisma.post.findUnique({ where: { id } });

    const isOwner = post?.authorId === req.userId;
    const isAdmin = req.userRole === "admin";
    console.log("userId:", req.userId, "role:", req.userRole);

    if (!post || (!isOwner && !isAdmin)) {
      res.status(403).json({ error: "Yetkisiz işlem" });
      return;
    }

    const updated = await prisma.post.update({
      where: { id },
      data: { title, content },
      include: {
        author: {
          select: {
            name: true,
            email: true, // veya sadece name: true da olur
          },
        },
      },
    });
    
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({ where: { id } });

    const isOwner = post?.authorId === req.userId;
    const isAdmin = req.userRole === "admin";
    if (!post || (!isOwner && !isAdmin)) {
      res.status(403).json({ error: "Yetkisiz işlem" });
      return;
    }

    // Önce ilgili yorumları sil
    await prisma.comment.deleteMany({ where: { postId: id } });

    // Sonra postu sil
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
