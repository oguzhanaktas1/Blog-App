// src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined in environment variables!");
}

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  console.log("Gelen body:", req.body);
  const { name, email, password, username } = req.body;

  if (!username || username.trim() === "") {
    return res.status(400).json({ error: "Username is required" });
  }
  if (!email || email.trim() === "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }


  try {
    // email veya username zaten var mı kontrol et
    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, username },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        username: user.username,
      },
      JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, username: user.username } });
  } catch (err) {
    console.error("Signup error:", err);
    next(err);
  }
};


export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || email.trim() === "") {
    return res.status(400).json({ error: "Email is required" });
  }
  if (!password || password.trim() === "") {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        username: user.username,
      },
      JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, username: user.username } });
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
};