import { randomUUID } from "crypto";

interface IJob {
  callback: string;
  payload?: string | Object;
  recurrency?: number;
  queueId?: string;
}

export class Job {
  public id: string;
  public queueId: string;
  public callback: string;
  public payload?: string | Object;

  public nextCall: Date;
  public recurrency: number;

  constructor({ callback, payload, recurrency = 0, queueId }: IJob) {
    this.id = randomUUID();
    this.callback = callback;
    this.recurrency = recurrency;

    this.setNextCall();

    if (queueId) {
      this.queueId = queueId;
    }

    if (payload) {
      this.payload = this.normalize(payload);
    }
  }

  setNextCall = () => {
    this.nextCall = new Date(Date.now() + 1000 * this.recurrency);
  };

  normalize = (payload: string | Object) => {
    if (typeof payload === "string") {
      return payload;
    } else {
      return JSON.stringify(payload);
    }
  };
}
