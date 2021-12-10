import axios, { AxiosInstance } from "axios";
import { randomUUID } from "crypto";
import { Job } from "./job";

export class Queue {
  public id: string;
  public asleep: Date | null;

  protected items: Job[];

  protected axios: AxiosInstance;

  constructor() {
    this.id = randomUUID();
    this.items = [];
    this.asleep = new Date();

    this.axios = axios.create({
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`[${this.size()}] Queue ${this.id} created`);
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

  size = () => {
    return this.items.length;
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

      if (job.nextCall.getTime() >= new Date().getTime()) {
        this.send(job);
        return;
      }

      console.log(`[${this.size()}] Queue ${this.id} running job ${job.id}`);
      await axios
        .post(job.callback, {
          payload:
            typeof job.payload === "string"
              ? JSON.parse(job.payload)
              : job.payload,
        })
        .then(() => {
          console.log(
            `[${this.size()}] Queue ${this.id} completed job ${job.id}`
          );

          if (job.recurrency > 0) {
            job.setNextCall();
            console.log(
              `[${this.size()}] Job ${job.id} will run again in ${
                job.recurrency
              } seconds`
            );
            this.send(job);
          }
        });
    }

    console.log(`[${this.size()}] Queue ${this.id} is empty`);
    this.sleep();
  };

  sleep = () => {
    console.log(`[${this.size()}] Queue ${this.id} is sleeping`);
    this.asleep = new Date();
  };

  wakeUp = () => {
    if (this.asleep) {
      this.asleep = null;
      console.log(`[${this.size()}] Queue ${this.id} is awake`);
      this.run();
    }
  };
}
