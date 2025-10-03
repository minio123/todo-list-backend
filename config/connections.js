// import { Client, Pool } from "pg";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();
const env = process.env;

// Sequelize instance
const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  dialect: env.DB_DIALECT,
  logging: env.DB_LOGGING === "true" ? console.log : false,
  port: env.DB_PORT,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
