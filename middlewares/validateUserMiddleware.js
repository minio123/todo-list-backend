import asyncHandler from "express-async-handler";

// utils
import { checkUser, checkUserUpdate } from "../util/duplicateChecker.js";
import { checkProvider } from "../util/checkProvider.js";

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
  const user_id = req.user;
  const { email } = req.body;

  if (!user_id) {
    return res.status(400).json({
      status: "error",
      message: "User ID is required",
    });
  }

  const emailExist = await checkUserUpdate(user_id, email);
  if (emailExist) {
    return res.status(400).json({
      status: "error",
      message: "User already exists",
    });
  }

  next();
});

const checkLoginProvider = asyncHandler(async (req, res, next) => {
  const user_id = req.user;

  const isDefault = await checkProvider(user_id);
  console.log(isDefault);
  if (!isDefault) {
    return res.status(401).json({
      status: "error",
      message: "Unable to update google user info",
    });
  }
  next();
});

export { checkUserExistence, checkUpdateUserExistence, checkLoginProvider };
