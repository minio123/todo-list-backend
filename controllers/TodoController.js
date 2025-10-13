import AsyncHandler from "express-async-handler";
import sequelize from "../config/connections.js";
import { Op } from "sequelize";

// Controllers
import { createUserLog } from "../controllers/UserLogController.js";

// Models
import { Todo, User } from "../models/index.js";

// Utils
import { captureError } from "../util/sentry.js";
import { checkTodo } from "../util/duplicateChecker.js";

const listTodo = AsyncHandler(async (req, res) => {
  try {
    const user_id = req.user;
    const {
      category = "personal",
      search = "",
      page = 1,
      sort_by = "created_at",
      sort = "desc",
      limit = 25,
    } = req.query;

    const searchFilter = {
      [Op.or]: [
        {
          todo_name: {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    };

    const todos = await Todo.findAll({
      attributes: ["id", "todo_name", "status", "deadline", "category"],
      where: {
        user_id,
        is_active: true,
        category,
        ...searchFilter,
      },
      limit,
      offset: page * limit,
      order: [[sort_by, sort]],
    });

    const todoCount = await Todo.count({
      where: {
        user_id: user_id,
        is_active: true,
        ...searchFilter,
      },
    });

    return res.status(200).json({
      status: "success",
      data: todos,
      totalPages: Math.ceil(todoCount / limit),
      currentPage: page,
      totalItems: todoCount,
    });
  } catch (error) {
    await captureError(error, {
      extra: {
        action: "controllers/todoController.js -> listTodo",
      },
    });
    throw error;
  }
});

const createTodo = AsyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  const user_id = req.user;
  const { todoName, deadline, status, category } = req.body;

  try {
    const duplicateTodo = await checkTodo(user_id, todoName, category);
    if (duplicateTodo) {
      await t.rollback();
      return res.status(409).json({
        status: "error",
        message: "Todo with the same name already exists",
      });
    }

    const insert_todo = await Todo.create(
      {
        todo_name: todoName,
        deadline: deadline,
        status: status,
        category: category,
        user_id: user_id,
        is_active: true,
      },
      { transaction: t, returning: true }
    );
    if (!insert_todo) {
      await t.rollback();
      const error = new Error("Todo not inserted to database");
      await captureError(error, {
        extra: {
          action: "controllers/todoController.js -> createTodo",
        },
      });
      throw error;
    }

    const logActivity = `Created a new todo: ${todoName}`;
    const logCreated = await createUserLog(user_id, logActivity);

    if (!logCreated) {
      await t.rollback();
      const error = new Error("User log not inserted to database");
      throw error;
    }

    await t.commit();
    return res.status(201).json({
      status: "success",
      message: "Todo created successfully",
    });
  } catch (error) {
    await t.rollback();
    await captureError(error, {
      extra: {
        action: "controllers/todoController.js -> createTodo",
      },
    });

    throw error;
  }
});

const updateTodo = AsyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  const user_id = req.user;
  const { todoName, status, deadline, category } = req.body;
  const todo_id = req.params.id;
  try {
    const todo = await Todo.findOne({
      where: {
        id: todo_id,
        user_id: user_id,
        is_active: true,
      },
    });
    if (!todo) {
      await t.rollback();
      return res.status(404).json({
        status: "error",
        message: "Todo not found",
      });
    }
    todo.todo_name = todoName || todo.todo_name;
    todo.status = status || todo.status;
    todo.category = category || todo.category;
    todo.deadline = deadline || todo.deadline;

    const logActivity = `Updated a todo: ${todoName}`;
    const logCreated = await createUserLog(user_id, logActivity);

    if (!logCreated) {
      await t.rollback();
      const error = new Error("User log not inserted to database");
      throw error;
    }

    await todo.save({ transaction: t });
    await t.commit();
    return res.status(200).json({
      status: "success",
      message: "Todo updated successfully",
    });
  } catch (error) {
    await t.rollback();
    await captureError(error, {
      extra: {
        action: "controllers/todoController.js -> updateTodo",
      },
    });

    throw error;
  }
});

const deleteTodo = AsyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  const user_id = req.user;
  const { todo_id } = req.body;
  try {
    const delete_todo = await Todo.update(
      {
        is_active: false,
      },
      {
        where: {
          id: { [Op.in]: todo_id },
          user_id: user_id,
          is_active: true,
        },
        transaction: t,
        returning: true,
      }
    );

    if (!delete_todo) {
      await t.rollback();
      const error = new Error("Todo not deleted");
      await captureError(error, {
        extra: {
          action: "controllers/todoController.js -> deleteTodo",
        },
      });
      throw error;
    }

    todo_id.map(async (id) => {
      const todo = await Todo.findOne({
        where: {
          id: id,
          user_id: user_id,
        },
      });

      const todoName = todo.todo_name;

      const logActivity = `Deleted a todo: ${todoName}`;
      const logCreated = await createUserLog(user_id, logActivity);

      if (!logCreated) {
        await t.rollback();
        const error = new Error("User log not inserted to database");
        throw error;
      }
    });

    await t.commit();
    return res.status(200).json({
      status: "success",
      message: "Todo deleted successfully",
    });
  } catch (error) {
    await t.rollback();
    await captureError(error, {
      extra: {
        action: "controllers/todoController.js -> deleteTodo",
      },
    });

    throw error;
  }
});

const updateStatus = AsyncHandler(async (req, res) => {
  const t = await sequelize.transaction();
  const user_id = req.user;
  const { todo_id, status } = req.body;

  try {
    const update_status = await Todo.update(
      {
        status: status,
      },
      {
        where: {
          id: { [Op.in]: todo_id },
          user_id: user_id,
          is_active: true,
        },
        transaction: t,
        returning: true,
      }
    );

    if (!update_status) {
      await t.rollback();
      const error = new Error("Todo status not updated");
      await captureError(error, {
        extra: {
          action: "controllers/todoController.js -> updateStatus",
        },
      });
      throw error;
    }

    todo_id.map(async (id) => {
      const todo = await Todo.findOne({
        where: {
          id: id,
          user_id: user_id,
          is_active: true,
        },
      });

      const todoName = todo.todo_name;

      const logActivity = `Updated todo status: ${todoName}`;
      const logCreated = await createUserLog(user_id, logActivity);

      if (!logCreated) {
        await t.rollback();
        const error = new Error("User log not inserted to database");
        throw error;
      }
      todo.is_active = false;
    });

    await t.commit();
    return res.status(200).json({
      status: "success",
      message: "Todo status updated successfully",
    });
  } catch (error) {
    await t.rollback();
    captureError(error, {
      extra: {
        action: "controllers/todoController.js -> updateStatus",
      },
    });
  }
});

export { listTodo, createTodo, updateTodo, deleteTodo, updateStatus };
