import { Job } from "./job";
import { Queue } from "./queue";

export class Manager {
  protected queues: Queue[] = [];

  constructor() {
    this.queues = [];
  }

  public boot = (): void => {
    this.run();
    this.queues.forEach((queue) => {
      queue.garbageCollector();
    });
  };

  public addQueue(): void {
    this.queues.push(new Queue());
  }

  public removeQueue(queue: Queue) {
    console.log(
      `[${queue.size()}/${queue.fails()}] Queue ${
        queue.id
      } slept for 5 minutes, removing...`
    );
    this.queues = this.queues.filter((q) => q.id !== queue.id);
  }

  public getQueues(): Queue[] {
    return this.queues;
  }

  public removeJob(jobId: string) {
    const tmp = this.queues.map((queue) => {
      return queue.remove(jobId);
    });

    return tmp;
  }

  public retryJob(jobId: string) {
    const tmp = this.queues.map((queue) => {
      return queue.retry(jobId);
    });

    return tmp;
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
        console.log(
          `[${queue.size()}/${queue.fails()}] Job ${job.id} attached to ${
            queue.id
          }`
        );

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
