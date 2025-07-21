import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: "uploads/", // uploads klasörü oluşturulmalı
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/api/upload-profile-photo", upload.single("photo"), async (req, res) => {
    const { userId } = req.body;
  
    if (!req.file) {
      res.status(400).json({ error: "Dosya yüklenmedi." });
      return;
    }
  
    const filePath = `/uploads/${req.file.filename}`;
  
    try {
      await prisma.user.update({
        where: { id: Number(userId) },
        data: { profilePhoto: filePath },
      });
  
      res.status(200).json({ success: true, url: filePath });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Profil fotoğrafı güncellenemedi." });
    }
  });
  
  
