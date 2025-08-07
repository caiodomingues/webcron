import { Request, Response, NextFunction } from "express";
import { JobService } from "../services/job.service";
import logger from "../utils/log";
import { IJob } from "../models/job";

export class JobController {
  constructor(private jobService: JobService) {}

  async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await this.jobService.addJob(req.body as IJob);
      logger.info({ job, timestamp: new Date().toISOString() }, "Job added successfully");
      res.status(200).send({
        message: "Job added successfully",
        job,
      });
    } catch (err) {
      next(err);
    }
  }

  async retryJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await this.jobService.retryJob(req.params.id);
      if (job.length > 0) {
        res.status(200).send({ message: "Job reallocated to Queue", job });
      } else {
        res.status(404).send({ message: "Job not found" });
      }
    } catch (err) {
      next(err);
    }
  }

  async removeJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await this.jobService.removeJob(req.params.id);
      if (job.length > 0) {
        res.status(204).send();
      } else {
        res.status(404).send({ message: "Job not found" });
      }
    } catch (err) {
      next(err);
    }
  }
}
