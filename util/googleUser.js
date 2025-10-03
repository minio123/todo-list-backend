import asyncHandler from "express-async-handler";

// Model
import { User, UserAccount } from "../models/index.js";

// Sentry
import { captureError } from "../util/sentry.js";

// Sequelize
import sequelize from "../config/connections.js";

const createGoogleUser = asyncHandler(async (googleUser) => {
  const t = await sequelize.transaction();
  try {
    const create_google_user = await User.create(
      {
        firstname: googleUser.given_name,
        lastname: googleUser.family_name,
        display_picture: googleUser.picture,
      },
      { transaction: t, returning: true }
    );

    if (!create_google_user) {
      await t.rollback();
      const error = new Error("Google user not created");
      await captureError(error, {
        extra: {
          action: "controllers/authController.js -> googleAuth",
        },
      });
      throw error;
    }

    const create_user_account = await UserAccount.create(
      {
        user_id: create_google_user.id,
        email: googleUser.email,
        password: null,
      },
      { transaction: t },
      { returning: true }
    );

    if (!create_user_account) {
      await t.rollback();
      const error = new Error("Google account not created");
      await captureError(error, {
        extra: {
          action: "controllers/authController.js -> googleAuth",
        },
      });
      throw error;
    }

    await t.commit();
    return create_google_user.id;
  } catch (error) {
    await t.rollback();
    await captureError(error, {
      extra: {
        action: "controllers/authController.js -> createGoogleUser",
      },
    });
    throw error;
  }
});

export { createGoogleUser };
