// Sentry
import { initSentry } from "./util/sentry.js";

import express from "express";
import sequelize from "./config/connections.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { globalErrorHandler } from "./middlewares/errorHandlerMiddleware.js";

// Routes
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoutes.js";
import todoRoute from "./routes/todoRoutes.js";

//Cron jobs
import cleanUpToken from "./jobs/cleanUpTokens.js";
dotenv.config();

// .env configs
const env = process.env;
const node_env = env.NODE_ENV;
const port = env.HOST_PORT;
const host = env.HOST;
const origin = env.ORIGIN;

// google auth creds
const clientId = env.GOOGLE_LOGIN_CLIENT_ID;
const clientSecret = env.GOOGLE_LOGIN_CLIENT_SECRET;
const uri = env.REDIRECT_URI;

// cors config
const corsOptions = {
  origin: origin,
  credentials: true, //access-control-allow-credentials:true
};

const app = express();

// Calling sentry
const Sentry = initSentry(env.SENTRY_DSN, node_env);

app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Start cron jobs
cleanUpToken();

// Routes
app.use("/api/auth", authRoute({ clientId, clientSecret, uri }));
app.use("/api/user", userRoute());
app.use("/api/todo", todoRoute());

// Sentry handlers
Sentry.setupExpressErrorHandler(app);
app.use(globalErrorHandler);

const server = app.listen(port, host, () => {
  console.log(`Running at http://${host}:${port}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");
  await sequelize.close();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
