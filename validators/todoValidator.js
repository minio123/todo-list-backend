import { body, validationResult } from "express-validator";

export const validateTodoInput = [
  body("todoName").notEmpty().withMessage("Todo name is required"),
  body("deadline").notEmpty().withMessage("Due date is required"),
  body("status").notEmpty().withMessage("Task status is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: "error", message: "Please check the required fields" });
    }
    next();
  },
];
