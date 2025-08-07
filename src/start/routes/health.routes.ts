import { Router } from "express";
import { HealthController } from "../../controllers/health.controller";

export function createHealthRoutes(controller: HealthController): Router {
  const router = Router();
  router.get("/health", controller.getHealth.bind(controller));
  return router;
}
