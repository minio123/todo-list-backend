import express from "express";
import { validateTodoInput } from "../validators/todoValidator.js";

// Controllers
import {
  listTodo,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/TodoController.js";

// Middlewares
import { protect } from "../middlewares/authMiddleware.js";
import {
  checkTodoDuplicate,
  checkTodoUpdateDuplicate,
} from "../middlewares/todoMiddleware.js";

export default function todoRoute() {
  const router = express.Router();

  router.get("/", protect, listTodo);
  router.post(
    "/create",
    protect,
    checkTodoDuplicate,
    validateTodoInput,
    createTodo
  );
  router.put(
    "/update/:id",
    protect,
    checkTodoUpdateDuplicate,
    validateTodoInput,
    updateTodo
  );
  router.delete("/delete/:id", protect, deleteTodo);

  return router;
}
