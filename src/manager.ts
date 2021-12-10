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

  public removeQueue(queue: Queue) {
    this.queues = this.queues.filter((q) => q.id !== queue.id);
  }

  public getQueues(): Queue[] {
    return this.queues;
  }

  public addJob(job: Job) {
    if (this.queues.length === 0) {
      this.addQueue();
    }

    const queueAvailable = this.queues.some((queue) => {
      return !queue.isFull();
    });

    if (!queueAvailable) {
      this.addQueue();
    }

    this.queues.some((queue) => {
      if (!queue.isFull()) {
        console.log(`[${queue.size()}] Job ${job.id} added to ${queue.id}`);
        queue.send(job);
        return true;
      }
    });
  }

  public run = () => {
    this.queues.forEach((queue) => {
      queue.run();
    });
  };
}
