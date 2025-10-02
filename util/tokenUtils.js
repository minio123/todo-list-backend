import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sequelize from "../config/connections.js";
import AsyncHandler from "express-async-handler";
import { Op } from "sequelize";

// Sentry
import { captureError } from "./sentry.js";

// Models
import { Token, User, UserAccount } from "../models/index.js";

const generateAccessToken = AsyncHandler(async (res, user_id) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const jwtSecret = process.env.JWT_SECRET;
    const pepper = process.env.AUTH_PEPPER;

    const accessToken = jwt.sign({ user_id: user_id }, jwtSecret, {
      expiresIn: "1h",
    });

    // const hashedAccessToken = await bcrypt.hash(accessToken + pepper, salt);

    // if (!hashedAccessToken) {
    //   const error = new Error("JWT token not hashed");
    //   await captureError(error, {
    //     extra: { action: "util/tokenUtils.js -> generateAccessTokenz" },
    //   });
    //   return false;
    // }

    return accessToken;
  } catch (error) {
    await captureError(error, {
      extra: { action: "util/tokenUtils.js -> generateAccessToken" },
    });
    throw error;
  }
});

const verifyAccessToken = AsyncHandler(async (token) => {
  const jwtSecret = process.env.JWT_SECRET;
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user_id = decoded.user_id;

    if (!user_id) {
      return false;
    }

    const isUserActive = await User.findOne({
      where: {
        id: user_id,
        is_active: true,
      },
    });

    if (!isUserActive) {
      return false;
    }

    return user_id;
  } catch (error) {
    await captureError(error, {
      extra: { action: "util/tokenUtils.js -> verifyToken" },
    });
    throw error;
  }
});

const generateRefreshToken = AsyncHandler(
  async (req, res, user_id, rememberMe) => {
    const t = await sequelize.transaction();
    try {
      const salt = await bcrypt.genSalt(10);
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      const pepper = process.env.AUTH_PEPPER;
      let ip =
        req.headers["x-forwarded-for"] ||
        req.ip ||
        req.connection.remoteAddress;
      ip = ip.split(",")[0].trim();
      const deviceInfo = req.headers["user-agent"];
      const refreshToken = jwt.sign({ user_id: user_id }, refreshTokenSecret, {
        expiresIn: rememberMe ? "30d" : "1d",
      });

      const hashedRefreshToken = await bcrypt.hash(refreshToken + pepper, salt);

      if (!hashedRefreshToken) {
        const error = new Error("JWT token not hashed");
        await captureError(error, {
          extra: { action: "util/tokenUtils.js -> generateRefreshToken" },
        });
        return false;
      }

      const insert_refresh_token = await Token.create(
        {
          user_id: user_id,
          token: hashedRefreshToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          type: "refresh",
          ip_address: ip,
          device_info: deviceInfo,
        },
        { transaction: t },
        { returning: true }
      );

      if (!insert_refresh_token) {
        await t.rollback();
        const error = new Error("Refresh token not inserted to database");
        await captureError(error, {
          extra: {
            action: "util/tokenUtils.js -> generateRefreshToken",
          },
        });
        return false;
      }

      res.cookie("refreshToken", refreshToken, {
        hhttpOnly: true,
        sameSite: "strict",
        secure: false,
        path: "/",
        domain: "localhost",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await t.commit();
      return insert_refresh_token.id;
    } catch (error) {
      await captureError(error, {
        extra: { action: "util/tokenUtils.js -> generateRefreshToken" },
      });
      throw error;
    }
  }
);

const verifyRefreshToken = AsyncHandler(async (req, refreshToken) => {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const user_id = jwt.verify(refreshToken, refreshTokenSecret).user_id;
  const pepper = process.env.AUTH_PEPPER;
  let ip =
    req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;
  ip = ip.split(",")[0].trim();
  const deviceInfo = req.headers["user-agent"];
  try {
    const checkRefreshToken = await Token.findOne({
      attributes: ["user_id", "token"],
      where: {
        user_id: user_id,
        type: "refresh",
        revoked: false,
        expires_at: {
          [Op.gt]: new Date(),
        },
        ip_address: ip,
        device_info: deviceInfo,
      },
    });

    if (!checkRefreshToken) {
      return checkRefreshToken;
    }

    if (!user_id) {
      return false;
    }

    const isMatch = await bcrypt.compare(
      refreshToken + pepper,
      checkRefreshToken.token
    );

    if (!isMatch) {
      return false;
    }

    const compareToken = await bcrypt.compare(
      refreshToken + pepper,
      checkRefreshToken.token
    );

    if (!compareToken) {
      return false;
    }

    const isUserActive = await UserAccount.findOne({
      where: {
        user_id: user_id,
        is_active: true,
      },
    });

    if (!isUserActive) {
      return false;
    }

    return user_id;
  } catch (error) {
    captureError(error, {
      extra: { action: "util/tokenUtils.js -> verifyRefreshToken" },
    });
    throw error;
  }
});

const revokeRefreshToken = AsyncHandler(async (req, user_id) => {
  const t = await sequelize.transaction();
  let ip =
    req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress;
  ip = ip.split(",")[0].trim();
  const deviceInfo = req.headers["user-agent"];
  try {
    const revokeToken = await Token.update(
      {
        revoked: true,
      },
      {
        where: {
          user_id: user_id,
          type: "refresh",
          revoked: false,
          expires_at: {
            [Op.gt]: new Date(),
          },
          ip_address: ip,
          device_info: deviceInfo,
        },
      }
    );

    if (!revokeToken) {
      const error = new Error("Refresh token not revoked");
      throw error;
    }

    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    captureError(error, {
      extra: { action: "util/tokenUtils.js -> revokeRefreshToken" },
    });
    throw error;
  }
});

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
};
