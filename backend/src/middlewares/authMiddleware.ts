import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

interface TokenPayload extends JwtPayload {
  userId: number;
  role: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
    return;
  }
};

export const authorizeRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "No token" });
      return;
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded.role !== role) {
        res.status(403).json({ error: "Yetkisiz erişim" });
        return;
      }

      req.userId = decoded.userId;
      next();
    } catch {
      res.status(403).json({ error: "Geçersiz token" });
      return;
    }
  };
};

