import express from "express";

// Controller functions
import {
  createUser,
  updateUser,
  updatePassword,
} from "../controllers/UserController.js";

// Middleware functions
import {
  checkUserExistence,
  checkUpdateUserExistence,
} from "../middlewares/validateUserMiddleware.js";

import { protect } from "../middlewares/authMiddleware.js";

// Validators
import {
  createUserValidator,
  updateUserValidator,
  updatePasswordValidator,
} from "../validators/userValidator.js";

export default function userRoute() {
  const router = express.Router();

  router.post("/create", createUserValidator, checkUserExistence, createUser);
  router.put(
    "/update/:id",
    protect,
    updateUserValidator,
    checkUpdateUserExistence,
    updateUser
  );

  router.put(
    "/update/password/:id",
    protect,
    updatePasswordValidator,
    updatePassword
  );

  return router;
}
