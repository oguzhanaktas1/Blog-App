import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error(
    "JWT_SECRET is not defined in environment variables! Server might not function correctly."
  );
  // process.exit(1); // Uncomment this in production
}
interface UserInRequest {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
  user?: UserInRequest;
}

interface TokenPayload extends JwtPayload {
  userId: number;
  role: string;
  username: string;
  name: string;
  email: string;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next({ status: 401, message: "Access denied" });
  }

  if (!JWT_SECRET) {
    return next({
      status: 500,
      message: "Server configuration error: JWT_SECRET is missing.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return next({ status: 403, message: "Invalid token" });
  }
};

export const authorizeRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next({ status: 401, message: "No token" });
    }

    if (!JWT_SECRET) {
      return next({
        status: 500,
        message: "Server configuration error: JWT_SECRET is missing.",
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;
      if (decoded.role !== role) {
        return next({ status: 403, message: "Yetkisiz erişim" });
      }

      req.userId = decoded.userId;
      
      next();
    } catch (err) {
      console.error("Authorization error:", err);
      return next({ status: 403, message: "Geçersiz token" });
    }
  };
};

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next({ status: 401, message: "Token bulunamadı" });
  }

  const token = authHeader.split(" ")[1];

  if (!JWT_SECRET) {
    return next({ status: 500, message: "Server configuration error: JWT_SECRET is missing." });
}
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.error("Auth middleware general error:", error);
    return next({ status: 401, message: "Geçersiz token" });
  }
};
