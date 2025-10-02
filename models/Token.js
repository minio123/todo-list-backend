import sequelize from "../config/connections.js";
import { DataTypes } from "sequelize";

const Token = sequelize.define(
  "Token",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true,
    },
    device_info: {
      type: DataTypes.TEXT,
    },
    last_used_at: {
      type: DataTypes.DATE,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
    },
  },
  { tableName: "user_tokens", timestamps: true, underscored: true }
);

export default Token;
