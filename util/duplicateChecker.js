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
        email: email,
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

const checkUserUpdate = asyncHandler(async (user_id, email) => {
  try {
    const check_query = await UserAccount.findOne({
      where: {
        email: email,
        is_active: true,
        user_id: {
          [Op.ne]: user_id,
        },
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
<<<<<<< HEAD
        todo_name: { [Op.iLike]: todoName },
        category: category,
=======
        category: category,
        todo_name: todoName,
>>>>>>> dc230a60d7b283006ec3aae98463e35702fa525d
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

const checkTodoUpdate = asyncHandler(
  async (user_id, todoName, category, todo_id) => {
    try {
      const check_query = await Todo.findOne({
        where: {
          user_id: user_id,
          category: category,
          todo_name: todoName,
          is_active: true,
          id: {
            [Op.ne]: todo_id,
          },
        },
      });

      return check_query;
    } catch (error) {
      await captureError(error, {
        extra: {
          action: "util/duplicateChecker.js -> checkTodoUpdate",
        },
      });
      throw error;
    }
  }
);

export { checkUser, checkUserUpdate, checkTodo, checkTodoUpdate };
