import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../util/tokenUtils.js";

// Sentry
import { captureError } from "../util/sentry.js";

const protect = async (req, res, next) => {
  const token = req.cookies.accessToken;

  let isAuthorized = await verifyAccessToken(token);
  if (!isAuthorized) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const isRefreshVerified = await verifyRefreshToken(req, refreshToken);
    if (!isRefreshVerified) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const issueNewAccessToken = await generateAccessToken(
      req,
      res,
      isRefreshVerified
    );

    if (!issueNewAccessToken) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    isAuthorized = await verifyAccessToken(issueNewAccessToken);
  }

  req.user = isAuthorized;

  next();
};

const protectRefresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }
  try {
    const isAuthorized = await verifyRefreshToken(req, refreshToken);

    if (!isAuthorized) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    req.user = isAuthorized;

    next();
  } catch (error) {
    captureError(error, {
      extra: { action: "util/tokenUtils.js -> verifyRefreshToken" },
    });
    throw error;
  }
};

const validateAuthInput = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }

  next();
};

export { protect, protectRefresh, validateAuthInput };
