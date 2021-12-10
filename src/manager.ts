import { Job } from "./job";
import { Queue } from "./queue";

export class Manager {
  protected queues: Queue[] = [];

  constructor() {
    this.queues = [];
  }

  public addQueue(): void {
    this.queues.push(new Queue());
  }

  public getQueues(): Queue[] {
    return this.queues;
  }

  public addJob(job: Job) {
    this.queues.every((queue) => {
      if (queue.isFull()) {
        console.log("All available queues are full, creating new queue");
        this.addQueue();
        return true;
      }
    });

    this.queues.some((queue) => {
      if (!queue.isFull()) {
        console.log(`Job ${job.id} added to ${queue.id}`);
        queue.send(job);
        return true;
      }
    });
  }
}
