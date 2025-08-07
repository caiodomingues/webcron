import { randomUUID } from "crypto";
import { Job } from "../models/job";
import logger from "../utils/log";
import { NetworkError } from "../errors/NetworkError";
import { queueConfig } from "../config/queue";

export class Queue {
  public id: string;
  public asleep: Date | null;

  protected items: Job[];
  protected failed: Job[];

  protected maxSize: number;
  constructor(maxSize: number = queueConfig.maxSize) {
    this.id = randomUUID();
    this.items = [];
    this.failed = [];
    this.asleep = new Date();
    this.maxSize = maxSize;
    logger.info(
      { queueId: this.id, maxSize: this.maxSize, timestamp: new Date().toISOString() },
      `[${this.size()}/${this.fails()}] Queue ${this.id} created`
    );
  }

  send = async (item: Job | Job[]): Promise<void> => {
    if (Array.isArray(item)) {
      this.items.push(...item);
    } else {
      this.items.push(item);
    }
    if (this.asleep) {
      await this.wakeUp();
    }
  };

  receive = () => {
    return this.items.shift();
  };

  remove = (job: Job | string) => {
    if (typeof job === "string") {
      job = this.items.find((item) => item.id === job) as Job;
    }

    if (job) {
      logger.info(`[${this.size()}/${this.fails()}] Job ${job.id} is being removed`);

      this.items = this.items.filter((item) => item.id !== (job as Job).id);

      return job;
    }
  };

  retry = (jobId: string) => {
    const job = this.failed.find((item) => item.id === jobId);

    if (job) {
      if (job.queueId) return;

      job.queueId = this.id;
      job.setNextCall();

      logger.info(`[${this.size()}/${this.fails()}] Retrying job ${job.id}`);
      this.kill(job);
      this.send(job);
    }

    return job;
  };

  size = () => {
    return this.items.length;
  };

  fails = () => {
    return this.failed.length;
  };

  kill = (job: Job) => {
    this.failed = this.failed.filter((item) => item.id !== job.id);

    if (this.fails() === 0) {
      logger.info(`[${this.size()}/${this.fails()}] Failed queue ${this.id} is empty`);
    }
  };

  isEmpty = () => {
    return this.size() === 0;
  };

  isFull = () => {
    return this.size() >= 60;
  };

  run = async (): Promise<void> => {
    if (this.asleep) return;
    while (!this.isEmpty()) {
      const job = this.receive();
      if (!job) return;
      if (job.recurrency > 0 && job.limit > 0 && job.scheduled >= job.limit) {
        logger.info(
          { jobId: job.id, queueId: this.id, timestamp: new Date().toISOString() },
          `[${this.size()}/${this.fails()}] Job ${job.id} limit reached, removing from queue`
        );
        return;
      }
      if (job.nextCall && job.nextCall.getTime() >= new Date().getTime()) {
        await this.send(job);
        return;
      }
      logger.info(
        { jobId: job.id, queueId: this.id, timestamp: new Date().toISOString() },
        `[${this.size()}/${this.fails()}] Queue ${this.id} running job ${job.id}`
      );
      try {
        const response = await fetch(job.callback, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: job.payload ?? "{}",
        });
        if (!response.ok)
          throw new NetworkError(
            `Request failed: ${response.status}`,
            response.status,
            await response.text()
          );
        logger.info(
          { jobId: job.id, queueId: this.id, timestamp: new Date().toISOString() },
          `[${this.size()}/${this.fails()}] Queue ${this.id} completed job ${job.id}`
        );
        job.analytics({ success: true });
        if (job.recurrency > 0) {
          job.setNextCall();
          logger.info(
            { jobId: job.id, queueId: this.id, timestamp: new Date().toISOString() },
            `[${this.size()}/${this.fails()}] Job ${job.id} will run again in ${job.recurrency} seconds`
          );
          await this.send(job);
        } else {
          job.previousCall = new Date();
          job.nextCall = null;
        }
      } catch (err) {
        if (err instanceof NetworkError) {
          logger.error(
            {
              err,
              jobId: job.id,
              queueId: this.id,
              status: err.status,
              details: err.details,
              timestamp: new Date().toISOString(),
            },
            `[${this.size()}/${this.fails()}] Network error running job ${job.id}`
          );
        } else {
          logger.error(
            { err, jobId: job.id, queueId: this.id, timestamp: new Date().toISOString() },
            `[${this.size()}/${this.fails()}] Error running job ${job.id}`
          );
        }
        job.analytics({ success: false });
        job.queueId = null;
        job.previousCall = new Date();
        this.failed.push(job);
        logger.info(
          { jobId: job.id, queueId: this.id, timestamp: new Date().toISOString() },
          `[${this.size()}/${this.fails()}] Job ${job.id} moved to failed queue`
        );
      }
    }
    logger.info(
      { queueId: this.id, timestamp: new Date().toISOString() },
      `[${this.size()}/${this.fails()}] Queue ${this.id} is empty`
    );
    this.sleep();
  };

  garbageCollector = () => {
    if (this.failed.length > 0) {
      this.failed.forEach((item) => {
        if (
          item.previousCall &&
          new Date(item.previousCall.getTime() + 1000 * 60 * 60 * 24).getTime() <
            new Date().getTime()
        ) {
          logger.info(
            `[${this.size()}/${this.fails()}] Job ${
              item.id
            } failed for more than 24h, killing from failed queue`
          );
          this.kill(item);
        }
      });
    }
  };

  sleep = () => {
    logger.info(`[${this.size()}/${this.fails()}] Queue ${this.id} is sleeping`);
    this.asleep = new Date();
  };

  wakeUp = async () => {
    if (this.asleep) {
      this.asleep = null;
      logger.info(`[${this.size()}/${this.fails()}] Queue ${this.id} is awake`);
      await this.run();
    }
  };
}
