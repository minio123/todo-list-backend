import express from "express";

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

  router.post("/todos", protect, listTodo);
  router.post("/create", protect, createTodo);
  router.put("/update/:id", protect, updateTodo);
  router.delete("/delete/:id", protect, deleteTodo);

  return router;
}
