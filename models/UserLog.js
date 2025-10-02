import { DataTypes } from "sequelize";
import sequelize from "../config/connections.js";

const UserLog = sequelize.define(
  "UserLog",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
    },
    activity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: "user_logs", timestamps: false, underscored: true }
);

export default UserLog;
