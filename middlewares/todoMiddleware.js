import asyncHandler from "express-async-handler";

// Sentry
import { captureError } from "../util/sentry.js";

// Utils
import { checkTodo, checkTodoUpdate } from "../util/duplicateChecker.js";

const checkTodoDuplicate = asyncHandler(async (req, res, next) => {
  const user_id = req.user;
  const { todoName, category } = req.body;

  try {
    const isDuplicate = await checkTodo(user_id, todoName, category);

    if (isDuplicate) {
      return res.status(400).json({
        status: "error",
        message: "Todo already exists",
      });
    }
  } catch (error) {
    await captureError(error, {
      extra: {
        action: "util/duplicateChecker.js -> checkTodo",
      },
    });
    throw error;
  }
  next();
});

const checkTodoUpdateDuplicate = asyncHandler(async (req, res, next) => {
  const user_id = req.user;
  const { todoName, category } = req.body;
  const todo_id = req.params.id;

  try {
    const isDuplicate = await checkTodoUpdate(
      user_id,
      todoName,
      category,
      todo_id
    );

    if (isDuplicate) {
      return res.status(400).json({
        status: "error",
        message: "Todo already exists",
      });
    }
  } catch (error) {
    await captureError(error, {
      extra: {
        action: "util/duplicateChecker.js -> checkTodoUpdate",
      },
    });
    throw error;
  }

  next();
});

export { checkTodoDuplicate, checkTodoUpdateDuplicate };

//
