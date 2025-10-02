import { DataTypes } from "sequelize";
import sequelize from "../config/connections.js";

const UserAccount = sequelize.define(
  "UserAccount",
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    login_provider: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "default",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
  },
  { tableName: "user_accounts", timestamps: true, underscored: true }
);

export default UserAccount;
