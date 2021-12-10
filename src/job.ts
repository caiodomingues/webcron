import { randomUUID } from "crypto";

interface IJob {
  callback: string;
  payload?: string | Object;
  recurrency?: number;
}

export class Job {
  public id: string;
  public callback: string;
  public payload?: string;

  public nextCall: Date;
  public recurrency: number;

  constructor({ callback, payload, recurrency = 1 }: IJob) {
    this.id = randomUUID();
    this.callback = callback;
    this.recurrency = recurrency;

    this.setNextCall();

    if (payload) {
      this.payload = this.normalizePayload(payload);
    }
  }

  setNextCall = () => {
    this.nextCall = new Date(Date.now() + 1000 * this.recurrency);
  };

  normalizePayload = (payload: string | Object) => {
    if (typeof payload === "string") {
      return payload;
    } else {
      return JSON.stringify(payload);
    }
  };
}
