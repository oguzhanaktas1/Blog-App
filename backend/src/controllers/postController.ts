import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getAllPosts: RequestHandler = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany();
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPostById: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const createPost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { title, content, authorId } = req.body;
    const newPost = await prisma.post.create({
      data: { title, content, authorId },
    });
    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const updatePost: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body;
    const updated = await prisma.post.update({
      where: { id },
      data: { title, content },
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePost: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
