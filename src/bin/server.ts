import app from "./app";

import logger from "../utils/log";
import { appConfig } from "../config/app";

const port = appConfig.port;
const host = appConfig.host;

const server = app.listen(port, () => {
  logger.info(`🚀 Server running on ${host}:${port}`);
});

const shutdown = () => {
  logger.info("Shutting down server...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
