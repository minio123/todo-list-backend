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

export { checkUserExistence, checkUpdateUserExistence };
