import asyncHandler from "express-async-handler";
import sequelize from "../config/connections.js";
import hashPassword from "../util/hashPassword.js";

// Sentry
import { captureError } from "../util/sentry.js";

// Controllers
import { createUserLog } from "../controllers/UserLogController.js";

// Models
import { User, UserAccount } from "../models/index.js";

const createUser = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  const { firstname, middlename, lastname, email, password, displayPicture } =
    req.body;
  try {
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      await t.rollback();
      const error = new Error("Password hashing failed");
      await captureError(error, {
        extra: {
          action: "controllers/userController.js -> createUser",
        },
      });
      throw error;
    }

    const insert_user = await User.create(
      {
        firstname: firstname,
        middlename: middlename,
        lastname: lastname,
        display_picture: displayPicture,
      },
      { transaction: t, returning: true }
    );

    if (!insert_user) {
      await t.rollback();
      const error = new Error("User not inserted to database");
      await captureError(error, {
        extra: {
          action: "controllers/userController.js -> createUser",
        },
      });
      throw error;
    }

    const insert_user_account = await UserAccount.create(
      {
        user_id: insert_user.id,
        email: email,
        password: hashedPassword,
      },
      { transaction: t, returning: true }
    );

    if (!insert_user_account) {
      await t.rollback();
      const error = new Error("User account not inserted to database");
      captureError(error, {
        extra: {
          action: "controllers/userController.js -> createUser",
        },
      });
      throw error;
    }
    await t.commit();
    return res.status(201).json({
      status: "success",
      message: "User created successfully",
    });
  } catch (error) {
    await sequelize.query("ROLLBACK");
    captureError(error, {
      extra: {
        action: "controllers/userController.js -> createUser",
      },
    });
    throw error;
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  const user_id = req.user;
  const { firstname, middlename, lastname, displayPicture } = req.body;

  try {
    const [affectedCount, affectedRows] = await User.update(
      {
        firstname: firstname,
        middlename: middlename,
        lastname: lastname,
        display_picture: displayPicture,
      },
      {
        where: {
          id: user_id,
          is_active: true,
        },
        transaction: t,
        returning: true,
      }
    );

    if (affectedCount === 0 && affectedRows.length === 0) {
      await t.rollback();
      const error = new Error("User not found");
      throw error;
    }

    const logActivity = `Updated user information`;
    const logCreated = await createUserLog(user_id, logActivity);

    if (!logCreated) {
      await t.rollback();
      const error = new Error("User log not inserted to database");
      throw error;
    }

    await t.commit();
    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
    });
  } catch (error) {
    captureError(error, {
      extra: {
        action: "controllers/userController.js -> updateUser",
      },
    });
    throw error;
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const t = await sequelize.transaction();

  const user_id = req.user;
  const { password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      t.rollback();
      const error = "Password hashing failed.";
      await captureError(error, {
        extra: {
          action: "controllers/userController.js -> updatePassword",
        },
      });
    }

    const [affectedCount] = await UserAccount.update(
      {
        password: hashedPassword,
      },
      {
        where: {
          user_id: user_id,
        },
        transaction: t,
        returning: true,
      }
    );

    if (affectedCount === 0) {
      await t.rollback();
      const error = new Error("User not found");
      captureError(error, {
        extra: {
          action: "controllers/userController.js -> updatePassword",
        },
      });
      throw error;
    }

    const logActivity = `Updated user password`;
    const logCreated = await createUserLog(user_id, logActivity);

    if (!logCreated) {
      await t.rollback();
      const error = new Error("User log not inserted to database");
      throw error;
    }

    await t.commit();
    return res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    captureError(error, {
      extra: {
        action: "controllers/userController.js -> updatePassword",
      },
    });
    throw error;
  }
});

export { createUser, updateUser, updatePassword };
