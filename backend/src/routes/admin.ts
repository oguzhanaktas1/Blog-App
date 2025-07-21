import express from "express";
import { prisma } from "../prisma/client";
import {
  authenticateToken,
  authorizeRole,
} from "../middlewares/authMiddleware";

const router = express.Router();

// ✅ GET /admin/users - Tüm kullanıcıları getir
router.get(
  "/users",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Kullanıcılar alınamadı." });
    }
  }
);

// ✅ GET /admin/users/:id - Belirli kullanıcıyı post ve yorumlarıyla getir
router.get(
  "/users/:id",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    const userId = Number(req.params.id);
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          posts: true,
          comments: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: "Kullanıcı bulunamadı" });
        return;
      }

      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Hata" });
      return;
    }
  }
);

export default router;
