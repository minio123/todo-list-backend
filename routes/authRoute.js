import express from "express";
// Middleware functions
import { protectRefresh, protect } from "../middlewares/authMiddleware.js";

// Validators
import { validateAuthInput } from "../validators/authValidator.js";

// Controller functions
import {
  authUser,
  googleAuth,
  logoutUser,
  refreshToken,
} from "../controllers/AuthController.js";

export default function authRoute({ clientId, clientSecret }) {
  const router = express.Router();

  router.post("/login", validateAuthInput, authUser);
  router.post("/google/callback", googleAuth({ clientId, clientSecret }));
  router.post("/logout", protect, logoutUser);
  router.post("/refresh", protectRefresh, refreshToken);

  return router;
}
