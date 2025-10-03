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

export default function todoRoute() {
  const router = express.Router();

  router.get("/", protect, listTodo);
  router.post("/create", protect, validateTodoInput, createTodo);
  router.put("/update/:id", protect, validateTodoInput, updateTodo);
  router.delete("/delete/:id", protect, deleteTodo);

  return router;
}
