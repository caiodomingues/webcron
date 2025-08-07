import { Express } from "express";
import { container } from "../container";
import { createJobRoutes } from "./routes/job.routes";
import { createHealthRoutes } from "./routes/health.routes";
import { createCallbackRoutes } from "./routes/callback.routes";

export function registerRoutes(app: Express) {
  app.use("/", createJobRoutes(container.resolve("jobController")));
  app.use("/", createHealthRoutes(container.resolve("healthController")));
  app.use("/", createCallbackRoutes(container.resolve("callbackController")));
}
