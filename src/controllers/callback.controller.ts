import { Request, Response, NextFunction } from "express";
import { CallbackService } from "../services/callback.service";
import logger from "../utils/log";

export class CallbackController {
  constructor(private callbackService: CallbackService) {}

  async handleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = this.callbackService.handleCallback(req.body);
      logger.info({ body: req.body, timestamp: new Date().toISOString() }, "Callback received");
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  }
}
