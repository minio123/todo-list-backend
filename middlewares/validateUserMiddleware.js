import asyncHandler from "express-async-handler";

// utils
import { checkUser, checkUserUpdate } from "../util/duplicateChecker.js";

const checkUserExistence = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const emailExist = await checkUser(email);
  if (emailExist) {
    return res.status(400).json({
      status: "error",
      message: "User already exists",
    });
  }

  next();
});

const checkUpdateUserExistence = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "User ID is required",
    });
  }

  const emailExist = await checkUserUpdate(id, email);
  if (emailExist) {
    return res.status(400).json({
      status: "error",
      message: "User already exists",
    });
  }

  next();
});

const validateUserInputs = asyncHandler((req, res, next) => {
  const { firstname, lastname, email } = req.body;

  if (!firstname || !lastname || !email) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  next();
});

const validatePassword = asyncHandler((req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({
      status: "error",
      message: "Passwords do not match",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      status: "error",
      message: "Password must be at least 8 characters",
    });
  }

  if (!/[a-z]/.test(password)) {
    return res.status(400).json({
      status: "error",
      message: "Password must contain at least one lowercase letter",
    });
  }

  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({
      status: "error",
      message: "Password must contain at least one uppercase letter",
    });
  }

  if (!/\d/.test(password)) {
    return res.status(400).json({
      status: "error",
      message: "Password must contain at least one number",
    });
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return res.status(400).json({
      status: "error",
      message: "Password must contain at least one special character",
    });
  }

  next();
});

export {
  checkUserExistence,
  checkUpdateUserExistence,
  validateUserInputs,
  validatePassword,
};
