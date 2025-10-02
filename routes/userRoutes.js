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
  validateUserInputs,
  validatePassword,
} from "../middlewares/validateUserMiddleware.js";

export default function userRoute() {
  const router = express.Router();

  router.post(
    "/create",
    validateUserInputs,
    validatePassword,
    checkUserExistence,
    createUser
  );
  router.put(
    "/update/:id",
    validateUserInputs,
    checkUpdateUserExistence,
    updateUser
  );

  router.put("/update/password/:id", validatePassword, updatePassword);

  return router;
}
