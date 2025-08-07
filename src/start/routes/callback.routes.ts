import { Router } from "express";
import { CallbackController } from "../../controllers/callback.controller";

export function createCallbackRoutes(controller: CallbackController): Router {
  const router = Router();
  router.post("/callback", controller.handleCallback.bind(controller));
  return router;
}
