import { UserLog } from "../models/index.js";
import AsyncHandler from "express-async-handler";
import sequelize from "../config/connections.js";
import { Op } from "sequelize";

// Sentry
import { captureError } from "../util/sentry.js";

const listUserLogs = AsyncHandler(async (req, res, next) => {
  const { user_id } = req.user;
  const { search = "" } = req.query;

  try {
    const logs = await UserLog.findAll({
      where: {
        user_id: user_id,
        is_active: true,
        activity: {
          [Op.like]: `%${search}%`,
        },
      },
    });

    const totalLogs = await UserLog.count({
      where: {
        user_id: user_id,
        is_active: true,
        activity: {
          [Op.like]: `%${search}%`,
        },
      },
    });

    return res.status(200).json({
      status: "success",
      data: logs,
      totalLogs: totalLogs,
    });
  } catch (error) {
    await captureError(error, {
      extra: {
        action: "controllers/userLogController.js -> listUserLogs",
      },
    });
    throw error;
  }
});

const createUserLog = AsyncHandler(async (user_id, activity) => {
  const t = await sequelize.transaction();
  try {
    await UserLog.create(
      {
        user_id,
        activity,
        is_active: true,
      },
      {
        transaction: t,
        returning: true,
      }
    );

    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    await captureError(error, {
      extra: {
        action: "controllers/userLogController.js -> createUserLog",
      },
    });
    return false;
  }
});

export { listUserLogs, createUserLog };
