import { Router } from "express";
import { JobController } from "../../controllers/job.controller";
import { validateBody } from "../../middlewares/validate";
import { jobSchema } from "../../controllers/schemas/job.schema";

export function createJobRoutes(controller: JobController): Router {
  const router = Router();
  router.post("/", [validateBody(jobSchema)], controller.createJob.bind(controller));
  router.put(":id", controller.retryJob.bind(controller));
  router.delete(":id", controller.removeJob.bind(controller));
  return router;
}
