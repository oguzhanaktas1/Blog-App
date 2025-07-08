import express from "express";
import { signup, login } from "../controllers/authController";

const router = express.Router();

// Async handler utility to fix type errors for async route handlers
type AsyncHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>;
const asyncHandler = (fn: AsyncHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));

export default router;
