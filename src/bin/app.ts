import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";

import logger from "../utils/log";
import { errorResponse } from "../utils/errorResponse";

import { container } from "../container";
import { appConfig } from "../config/app";
import { appTestConfig } from "../config/test";
import { rateLimitConfig } from "../config/rateLimit";

import { registerRoutes } from "../start/routes";

import { Manager } from "../core/manager";
import { JobService } from "../services/job.service";
import { HealthService } from "../services/health.service";
import { CallbackService } from "../services/callback.service";

import { JobController } from "../controllers/job.controller";
import { HealthController } from "../controllers/health.controller";
import { CallbackController } from "../controllers/callback.controller";

container.factory("manager", () => new Manager());
container.factory("jobService", () => new JobService(container.resolve("manager")));
container.factory("healthService", () => new HealthService());
container.factory("callbackService", () => new CallbackService());
container.factory(
  "jobController",
  () => new JobController(container.resolve("jobService"))
);
container.factory(
  "healthController",
  () => new HealthController(container.resolve("healthService"))
);
container.factory(
  "callbackController",
  () => new CallbackController(container.resolve("callbackService"))
);

const app = express();
const isTest = process.env.NODE_ENV === 'test';
const config = isTest ? appTestConfig : appConfig;
const limiter = rateLimit(rateLimitConfig);

app.use(express.json());
app.use(helmet(config.helmet));
app.use(cors(config.cors));
app.use(morgan("dev"));
app.use(limiter);

registerRoutes(app);

app.use((_req, res) => {
  res.status(404).send(errorResponse({
    name: "NotFoundError",
    message: "Resource not found",
    status: 404
  }));
});

app.use((err: unknown, _req: express.Request, res: express.Response) => {
  logger.error({ err, stack: (err as Error)?.stack }, err instanceof Error ? err.message : "Unhandled error");
  const response = errorResponse(err);
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return res.status(500).json({ message: 'Unknown error', status: 500, type: 'UnknownError' });
  }
  res.status(response.status || 500).json(response);
});

export { app };
