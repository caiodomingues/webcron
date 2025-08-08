
import { Router } from "express";
import { CallbackController } from "../../controllers/callback.controller";
import { validateBody } from "../../middlewares/validate";
import { callbackSchema } from "../../controllers/schemas/callback.schema";

export function createCallbackRoutes(controller: CallbackController): Router {
  const router = Router();
  router.post("/callback", [validateBody(callbackSchema)], controller.handleCallback.bind(controller));
  return router;
}
