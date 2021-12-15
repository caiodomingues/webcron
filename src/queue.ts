import axios, { AxiosInstance } from "axios";
import { randomUUID } from "crypto";
import { Job } from "./job";

export class Queue {
  public id: string;
  public asleep: Date | null;

  protected items: Job[];
  protected failed: Job[];

  protected axios: AxiosInstance;

  constructor() {
    this.id = randomUUID();
    this.items = [];
    this.failed = [];
    this.asleep = new Date();

    this.axios = axios.create({
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`[${this.size()}/${this.fails()}] Queue ${this.id} created`);
  }

  send = (item: Job | Job[]) => {
    if (Array.isArray(item)) {
      this.items.push(...item);
    } else {
      this.items.push(item);
    }

    if (this.asleep) {
      this.wakeUp();
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
      console.log(
        `[${this.size()}/${this.fails()}] Job ${job.id} is being removed`
      );

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

      console.log(`[${this.size()}/${this.fails()}] Retrying job ${job.id}`);
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
      console.log(
        `[${this.size()}/${this.fails()}] Failed queue ${this.id} is empty`
      );
    }
  };

  isEmpty = () => {
    return this.size() === 0;
  };

  isFull = () => {
    return this.size() >= 60;
  };

  run = async () => {
    if (this.asleep) return;

    while (!this.isEmpty()) {
      const job = this.receive();

      if (!job) return;

      if (job.recurrency > 0 && job.limit > 0 && job.scheduled >= job.limit) {
        console.log(
          `[${this.size()}/${this.fails()}] Job ${
            job.id
          } limit reached, removing from queue`
        );
        return;
      }

      if (job.nextCall && job.nextCall.getTime() >= new Date().getTime()) {
        this.send(job);
        return;
      }

      console.log(
        `[${this.size()}/${this.fails()}] Queue ${this.id} running job ${
          job.id
        }`
      );
      await axios
        .post(job.callback, {
          payload: job.payload,
        })
        .then(() => {
          console.log(
            `[${this.size()}/${this.fails()}] Queue ${this.id} completed job ${
              job.id
            }`
          );

          job.analytics({ success: true });

          if (job.recurrency > 0) {
            job.setNextCall();
            console.log(
              `[${this.size()}/${this.fails()}] Job ${
                job.id
              } will run again in ${job.recurrency} seconds`
            );
            this.send(job);
          } else {
            job.previousCall = new Date();
            job.nextCall = null;
          }
        })
        .catch(() => {
          job.analytics({ success: false });
          job.queueId = null;
          job.previousCall = new Date();

          this.failed.push(job);

          console.log(
            `[${this.size()}/${this.fails()}] Job ${
              job.id
            } moved to failed queue`
          );
        });
    }

    console.log(`[${this.size()}/${this.fails()}] Queue ${this.id} is empty`);
    this.sleep();
  };

  garbageCollector = () => {
    if (this.failed.length > 0) {
      this.failed.forEach((item) => {
        if (
          item.previousCall &&
          new Date(
            item.previousCall.getTime() + 1000 * 60 * 60 * 24
          ).getTime() < new Date().getTime()
        ) {
          console.log(
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
    console.log(
      `[${this.size()}/${this.fails()}] Queue ${this.id} is sleeping`
    );
    this.asleep = new Date();
  };

  wakeUp = () => {
    if (this.asleep) {
      this.asleep = null;
      console.log(`[${this.size()}/${this.fails()}] Queue ${this.id} is awake`);
      this.run();
    }
  };
}
