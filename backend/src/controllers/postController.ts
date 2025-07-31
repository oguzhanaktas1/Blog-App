import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { validationResult } from "express-validator";
import { AuthRequest } from "../middlewares/authMiddleware";
import fs from "fs";
import { notifyUser } from "../utils/notifyUser";

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
            profilePhoto: true,
          },
        },
        images: true,
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
      include: {
        author: {
          select: {
            name: true,
            email: true,
            profilePhoto: true,
          },
        },
        images: true,
      },
    });
    if (!post) {
      return next({ status: 404, message: "Post not found" });
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ status: 400, message: "Validation error", errors: errors.array() });
  }
  try {
    const { title, content } = req.body;
    const authorId = req.userId!;
    const newPost = await prisma.post.create({
      data: { title, content, authorId },
      include: {
        author: { select: { name: true, email: true, profilePhoto: true } },
      },
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

    const post = await prisma.post.findUnique({ where: { id }, include: { images: true } });

    const isOwner = post?.authorId === req.userId;
    const isAdmin = req.userRole === "admin";
    console.log("userId:", req.userId, "role:", req.userRole);

    if (!post || (!isOwner && !isAdmin)) {
      return next({ status: 403, message: "Yetkisiz işlem" });
    }

    if (req.file) {
      for (const img of post.images) {
        if (img.url && fs.existsSync(`.${img.url}`)) {
          fs.unlinkSync(`.${img.url}`);
        }
        await prisma.image.delete({ where: { id: img.id } });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      await prisma.image.create({ data: { url: imageUrl, postId: id, userId: req.userId } });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: { title, content },
      include: {
        author: { select: { name: true, email: true, profilePhoto: true } },
        images: true,
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
    const post = await prisma.post.findUnique({ where: { id }, include: { images: true } });

    const isOwner = post?.authorId === req.userId;
    const isAdmin = req.userRole === "admin";
    if (!post || (!isOwner && !isAdmin)) {
      return next({ status: 403, message: "Yetkisiz işlem" });
    }

    for (const img of post.images) {
      if (img.url && fs.existsSync(`.${img.url}`)) {
        fs.unlinkSync(`.${img.url}`);
      }
      await prisma.image.delete({ where: { id: img.id } });
    }

    await prisma.like.deleteMany({ where: { postId: id } });

    await prisma.comment.deleteMany({ where: { postId: id } });

    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const likePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("likePost userId:", req.userId, "role:", req.userRole);

  try {
    const postId = Number(req.params.id);
    const userId = req.userId;

    if (!userId) {
      return next({ status: 401, message: "Giriş yapmalısınız" });
    }

    const existing = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      res.status(200).json({ liked: true });
      return;
    }

    await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    // Bildirim gönder (post sahibine)
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
      },
    });

    if (post && post.authorId !== userId) {
      const liker = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      const likerName = liker?.name || "Bir kullanıcı";
      const message = `${likerName} gönderinizi beğendi.`;

      await notifyUser(post.authorId, message, { postId: postId, type: "post_like", senderId: userId });

    }

    res.status(201).json({ liked: true });
  } catch (err) {
    next(err);
  }
};

export const unlikePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postId = Number(req.params.id);
    const userId = req.userId;
    if (!userId) { return next({ status: 401, message: "Giriş yapmalısınız" }); }

    const deleted = await prisma.like.deleteMany({ where: { userId, postId } });

    if (deleted.count > 0) {
      // Post sahibine beğeni kaldırıldığını bildir
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          authorId: true,
        },
      });

      if (post && post.authorId !== userId) {
        const unliker = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });

        const unlikerName = unliker?.name || "Bir kullanıcı";
        const message = `${unlikerName} gönderinizdeki beğenisini geri çekti.`;

        // notifyUser fonksiyonunu hem veritabanı hem de socket bildirimi için kullan
        await notifyUser(post.authorId, message, { postId: postId, type: "post_unlike", senderId: userId });
      }
    }

    res.status(200).json({ liked: false });
    return;
  } catch (err) {
    next(err);
  }
};

export const isPostLiked = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postId = Number(req.params.id);
    const userId = req.userId;
    if (!userId) { res.status(200).json({ liked: false }); return; }
    const like = await prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });
    res.status(200).json({ liked: !!like });
    return;
  } catch (err) {
    next(err);
  }
};

export const getLikedPosts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) { return next({ status: 401, message: "Giriş yapmalısınız" }); }
    const likes = await prisma.like.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: { name: true, email: true, profilePhoto: true } },
          },
        },
      },
      orderBy: { id: "desc" },
    });
    const posts = likes.map((like: { post: any; }) => like.post);
    res.status(200).json(posts);
    return;
  } catch (err) {
    next(err);
  }
};

export const uploadPostImage = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  const postId = Number(req.params.id);
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return next({ status: 400, message: "No files uploaded" });
  }
  try {
    const urls: string[] = [];
    for (const file of files) {
      const imageUrl = `/uploads/${file.filename}`;
      await prisma.image.create({
        data: {
          url: imageUrl,
          postId: postId,
          userId: req.userId,
        },
      });
      urls.push(imageUrl);
    }
    res.status(201).json({ urls });
    return;
  } catch (err) {
    next(err);
  }
};

export const deletePostImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const imageId = Number(req.params.id);
    const image = await prisma.image.findUnique({ where: { id: imageId } });
    if (!image) {
      return next({ status: 404, message: "Image not found" });
    }
    try {
      if (image.url && fs.existsSync(`.${image.url}`)) {
        fs.unlinkSync(`.${image.url}`);
      }
    } catch (err) {
      console.error("Dosya silinemedi:", err);
    }
    await prisma.image.delete({ where: { id: imageId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};