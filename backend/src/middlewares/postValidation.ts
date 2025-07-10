import { body } from "express-validator";

export const validatePost = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),

  body("content")
    .notEmpty()
    .withMessage("Content is required"),
];
