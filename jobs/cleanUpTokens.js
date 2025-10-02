import cron from "node-cron";
import { Op } from "sequelize";
import { Token } from "../models/index.js";

const cleanUpToken = () => {
  cron.schedule("*/60 * * * *", async () => {
    try {
      const result = await Token.destroy({
        where: {
          [Op.or]: {
            expires_at: {
              [Op.lt]: new Date(),
            },
            revoked: true,
          },
        },
      });
      console.log(`Cleaned up ${result} expired tokens.`);
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error);
    }
  });
};

export default cleanUpToken;
