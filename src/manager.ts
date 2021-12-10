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
    console.log(
      `[${queue.size()}] Queue ${queue.id} slept for 5 minutes, removing...`
    );
    this.queues = this.queues.filter((q) => q.id !== queue.id);
  }

  public getQueues(): Queue[] {
    return this.queues;
  }

  public removeJob(jobId: string) {
    this.queues.forEach((queue) => {
      queue.remove(jobId);
    });
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
        console.log(`[${queue.size()}] Job ${job.id} attached to ${queue.id}`);

        job.queueId = queue.id;

        queue.send(job);
        return true;
      }
    });
  }

  public run = () => {
    this.queues.forEach((queue) => {
      if (
        queue.asleep instanceof Date &&
        (new Date().getTime() - queue.asleep.getTime()) / 60000 >= 5
      ) {
        this.removeQueue(queue);
      }

      queue.run();
    });
  };
}
