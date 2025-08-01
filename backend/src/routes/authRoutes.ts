import express from "express";
import { signup, login } from "../controllers/authController";
import { validateSignup } from "../middlewares/validateSignup";
import { validateLogin } from "../middlewares/validateLogin";

const router = express.Router();

type AsyncHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>;
const asyncHandler = (fn: AsyncHandler) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/signup", validateSignup, asyncHandler(signup));
router.post("/login", validateLogin, asyncHandler(login));

export default router;
