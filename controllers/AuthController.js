import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";

// Model
import { User, UserAccount } from "../models/index.js";

// Utils
import {
  generateAccessToken,
  generateRefreshToken,
  revokeRefreshToken,
} from "../util/tokenUtils.js";
import { checkUser } from "../util/duplicateChecker.js";
import { createGoogleUser } from "../util/googleUser.js";

// Config
import sequelize from "../config/connections.js";

// Sentry
import { captureError } from "../util/sentry.js";

const googleAuth = ({ clientId, clientSecret, uri }) =>
  asyncHandler(async (req, res) => {
    // const pepper = process.env.AUTH_PEPPER || "default_pepper";
    try {
      const oauth2Client = new OAuth2Client(
        clientId,
        clientSecret,
        "http://localhost:5173"
      );
      const { code } = req.body;
      if (!code) {
        return res
          .status(400)
          .json({ status: "error", message: "Code is required" });
      }

      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens) {
        const error = new Error("OAuth token not returned");
        await captureError(error, {
          extra: {
            code,
            action: "/controllers/authController.js -> googleAuth",
          },
        });
        throw error;
      }

      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: clientId,
      });

      const googleUser = ticket.getPayload();
      const verUser = await checkUser(googleUser.email);
      let user_id = null;

      if (verUser === 0 || !verUser) {
        user_id = await createGoogleUser(googleUser);
      } else {
        user_id = verUser.id;
      }

      const accessToken = await generateAccessToken(user_id);
      const refreshToken = await generateAccessToken(user_id, false);

      if (!accessToken || !refreshToken) {
        const error = new Error("JWT token not generated");
        await captureError(error, {
          extra: {
            action: "controllers/authController.js -> googleAuth",
          },
        });
        throw error;
      }

      const userInfo = {
        user_id: user_id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        token: accessToken,
      };

      res.status(200).json({
        status: "success",
        message: "Succcess",
        user: userInfo,
      });
    } catch (error) {
      await captureError(error, {
        extra: {
          action: "/controllers/authController.js -> googleAuth",
        },
      });
      throw error;
    }
  });

const authUser = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  const { email, password, rememberMe } = req.body;
  const pepper = process.env.AUTH_PEPPER || "default_pepper";
  // const expiresAt = new Date(Date.now() + process.env.JWT_EXPIRES_IN * 1000);
  try {
    const auth_user = await UserAccount.findOne({
      attributes: ["user_id", "email", "password"],
      where: {
        email: email,
        is_active: true,
      },
      include: [
        {
          model: User,
          attributes: [
            [
              sequelize.fn(
                "CONCAT",
                sequelize.col("User.firstname"),
                " ",
                sequelize.col("User.lastname")
              ),
              "name",
            ],
            "display_picture",
          ],
        },
      ],
    });

    if (
      !auth_user ||
      (await bcrypt.compare(password + pepper, auth_user.password)) === false
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const accessToken = await generateAccessToken(res, auth_user.user_id);
    const refreshToken = await generateRefreshToken(
      req,
      res,
      auth_user.user_id,
      rememberMe
    );

    const returnData = {
      user_id: auth_user.user_id,
      email: auth_user.email,
      name: auth_user.User.dataValues.name,
      picture: auth_user.User.dataValues.display_picture,
      token: accessToken,
    };

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user: returnData,
    });
  } catch (error) {
    await t.rollback();
    await captureError(error, {
      extra: {
        action: "controllers/authController.js -> authUser",
      },
    });
    throw error;
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  // const { id } = req.user;
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/api/auth/refresh",
    expires: new Date(0),
  });

  return res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const user_id = req.user;

  try {
    const revokeToken = await revokeRefreshToken(req, user_id);
    if (!revokeToken) {
      const error = new Error("Refresh token not revoked");
      throw error;
    }
    const refreshToken = await generateRefreshToken(req, res, user_id, true);
    if (!refreshToken) {
      const error = new Error("Refresh token not generated");
      throw error;
    }

    const returnData = {
      user_id: user_id,
      token: refreshToken,
    };

    return res.status(200).json({
      status: "success",
      message: "Refresh token generated",
      user: returnData,
    });
  } catch (error) {
    await t.rollback();
    captureError(error, {
      extra: {
        action: "controllers/authController.js -> refreshToken",
      },
    });
  }
});
const refreshGoogleToken = ({ clientId, clientSecret, uri }) =>
  asyncHandler(async (req, res) => {});

export { authUser, googleAuth, refreshGoogleToken, logoutUser, refreshToken };
