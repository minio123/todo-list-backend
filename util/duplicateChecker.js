import asyncHandler from "express-async-handler";
import { Op } from "sequelize";

// Sentry
import { captureError } from "./sentry.js";

// Models
import { UserAccount, Todo } from "../models/index.js";

const checkUser = asyncHandler(async (email) => {
  try {
    const check_query = await UserAccount.findOne({
      where: {
        email: { [Op.iLike]: email },
        is_active: true,
      },
    });
    return check_query;
  } catch (error) {
    await captureError(error, {
      extra: { action: "util/duplicateChecker.js -> checkUser" },
    });
    throw error;
  }
});

const checkUserUpdate = asyncHandler(async (id, email) => {
  try {
    const check_query = await UserAccount.findOne({
      where: {
        email: { [Op.iLike]: email },
        is_active: true,
        user_id: { [Op.ne]: id },
      },
    });

    return check_query;
  } catch (error) {
    await captureError(error, {
      extra: {
        action: "util/duplicateChecker.js -> checkUserUpdate",
      },
    });
    throw error;
  }
});

const checkTodo = asyncHandler(async (user_id, todoName, category) => {
  try {
    const check_query = await Todo.findOne({
      where: {
        user_id: user_id,
        todo_name: { [Op.iLike]: todoName },
        category: category,
        is_active: true,
      },
    });

    return check_query;
  } catch (error) {
    await captureError(error, {
      extra: {
        action: "util/duplicateChecker.js -> checkTodo",
      },
    });
    throw error;
  }
});

export { checkUser, checkUserUpdate, checkTodo };
