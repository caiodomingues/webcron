import { Request, Response } from "express";
import { HealthService } from "../services/health.service";

export class HealthController {
  constructor(private healthService: HealthService) {}

  getHealth(_req: Request, res: Response): void {
    res.status(200).send(this.healthService.getHealth());
  }
}
