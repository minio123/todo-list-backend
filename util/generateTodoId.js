import { Todo } from "../models/index.js";
import AsyncHandler from "express-async-handler";

const generateTodoId = AsyncHandler(async (user_id) => {
  try {
    const lastTodo = await Todo.count({
      where: { user_id: user_id, is_active: true },
    });
    const newId = lastTodo + 1;
    return "TODO-" + String(newId).padStart(4, "0");
  } catch (error) {
    await captureError(error, {
      extra: {
        action: "util/generateTodoId.js -> generateTodoId",
      },
    });
    throw error;
  }
});

export { generateTodoId };
