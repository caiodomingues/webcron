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
import { rateLimitConfig } from "../config/rateLimit";

import { JobService } from "../services/job.service";
import { HealthService } from "../services/health.service";
import { CallbackService } from "../services/callback.service";

import { JobController } from "../controllers/job.controller";
import { HealthController } from "../controllers/health.controller";
import { CallbackController } from "../controllers/callback.controller";

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
const limiter = rateLimit(rateLimitConfig);

app.use(express.json());
app.use(helmet(appConfig.helmet));
app.use(cors(appConfig.cors));
app.use(morgan("dev"));
app.use(limiter);

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
  res.status(response.status || 500).send(response);
});

export default app;
