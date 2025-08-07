import { Job } from "../models/job";
import { Queue } from "../queue";
import logger from "../utils/log";

export class Manager {
  protected queues: Queue[] = [];

  constructor() {
    this.queues = [];
  }

  public boot = async (): Promise<void> => {
    await this.run();
    this.queues.forEach((queue) => {
      try {
        queue.garbageCollector();
      } catch (err) {
        logger.error({ err, queue }, `Error in garbageCollector for queue ${queue.id}`);
      }
    });
  };

  public addQueue(): void {
    this.queues.push(new Queue());
  }

  public removeQueue(queue: Queue) {
    logger.info(
      `[${queue.size()}/${queue.fails()}] Queue ${queue.id} slept for 5 minutes, removing...`
    );
    this.queues = this.queues.filter((q) => q.id !== queue.id);
  }

  public getQueues(): Queue[] {
    return this.queues;
  }

  public async removeJob(jobId: string): Promise<unknown[]> {
    return Promise.all(this.queues.map(async (queue) => queue.remove(jobId)));
  }

  public async retryJob(jobId: string): Promise<unknown[]> {
    return Promise.all(this.queues.map(async (queue) => queue.retry(jobId)));
  }

  public async addJob(job: Job): Promise<void> {
    if (this.queues.length === 0) {
      this.addQueue();
    }
    const queueAvailable = this.queues.some((queue) => !queue.isFull());
    if (!queueAvailable) {
      this.addQueue();
    }
    for (const queue of this.queues) {
      if (!queue.isFull()) {
        logger.info(
          {
            queueId: queue.id,
            jobId: job.id,
            size: queue.size(),
            fails: queue.fails(),
            timestamp: new Date().toISOString(),
          },
          `Job ${job.id} attached to ${queue.id}`
        );
        job.queueId = queue.id;
        await queue.send(job);
        break;
      }
    }
  }

  public run = async (): Promise<void> => {
    for (const queue of this.queues) {
      try {
        if (
          queue.asleep instanceof Date &&
          (new Date().getTime() - queue.asleep.getTime()) / 60000 >= 5
        ) {
          this.removeQueue(queue);
        }
        await queue.run();
      } catch (err) {
        logger.error({ err, queue }, `Error running queue ${queue.id}`);
      }
    }
  };
}
