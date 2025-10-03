import asyncHandler from "express-async-handler";

// Models
import { UserAccount } from "../models/index.js";

// Utils
import { captureError } from "./sentry.js";

const checkProvider = asyncHandler(async (user_id) => {
  try {
    const isDefault = await UserAccount.findOne({
      where: {
        user_id: user_id,
        login_provider: "default",
      },
    });

    if (!isDefault) {
      return false;
    }

    return true;
  } catch (error) {
    await captureError(error, {
      extra: { action: "util/checkProvider.js -> checkProvider" },
    });
    throw error;
  }
});

export { checkProvider };
