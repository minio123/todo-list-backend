import { Op } from "sequelize";
import cron from "node-cron";

// Models
import { Todo } from "../models/index.js";

// Sentry
import { captureError } from "../util/sentry.js";

const updateStatus = () => {
  cron.schedule("0 0 * * *", async () => {
    const today = new Date().toISOString();

    console.log(today);

    // try {
    //   const upadateDueToday = await Todo.update(
    //     {
    //       status: "DueToday",
    //     },
    //     {
    //       where: {
    //         is_active: true,
    //         deadline: today,
    //         status: "Pending",
    //       },
    //     }
    //   );

    //   const upadateOverdue = await Todo.update(
    //     {
    //       status: "Overdue",
    //     },
    //     {
    //       where: {
    //         is_active: true,
    //         status: {
    //           [Op.not]: "Done",
    //         },
    //         deadline: {
    //           [Op.lt]: today,
    //         },
    //       },
    //     }
    //   );

    //   if (
    //     upadateDueToday.affectedCount === 0 &&
    //     upadateOverdue.affectedCount === 0
    //   ) {
    //     const error = "Cron update todo status error";
    //     captureError(error, {
    //       extra: {
    //         action: "util/updateStatus.js -> updateStatus",
    //       },
    //     });
    //     throw error;
    //   }

    //   console.log("Updating todo status... " + today);
    // } catch (error) {
    //   captureError(error, {
    //     extra: {
    //       action: "util/updateStatus.js -> updateStatus",
    //     },
    //   });
    //   throw error;
    // }
  });
};

export default updateStatus;
