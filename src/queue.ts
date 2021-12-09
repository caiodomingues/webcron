import { Job } from "./job";

export class Queue {
  public items: Job[];

  constructor() {
    this.items = [];
  }

  send(item: Job) {
    this.items.push(item);
  }

  receive() {
    return this.items.shift();
  }

  size() {
    return this.items.length;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  run() {
    while (!this.isEmpty()) {
      const job = this.receive();
      console.log(job);
    }

    console.log("Queue is empty");
    return this;
  }
}
