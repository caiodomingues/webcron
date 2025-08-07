import { Router } from "express";
import { JobController } from "../../controllers/job.controller";

export function createJobRoutes(controller: JobController): Router {
  const router = Router();
  router.post("/", controller.createJob.bind(controller));
  router.put(":id", controller.retryJob.bind(controller));
  router.delete(":id", controller.removeJob.bind(controller));
  return router;
}
