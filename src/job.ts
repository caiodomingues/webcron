import { randomUUID } from "crypto";

interface IJob {
  callback: string;
  payload?: string | Object;
  recurrency?: number;
  queueId?: string;
}

interface IAnalytics {
  success: boolean;
}

export class Job {
  public id: string;
  public queueId: string | null;
  public callback: string;
  public payload?: string | Object;

  public scheduled: number;
  public failed: number;

  public previousCall: Date | null;
  public nextCall: Date | null;
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

    this.scheduled = 0;
    this.failed = 0;
  }

  setNextCall = () => {
    this.previousCall = new Date();
    this.nextCall = new Date(Date.now() + 1000 * this.recurrency);
  };

  analytics = ({ success }: IAnalytics) => {
    this.scheduled += 1;

    if (!success) {
      this.failed += 1;
    }
  };

  normalize = (payload: string | Object) => {
    if (typeof payload === "string") {
      return payload;
    } else {
      return JSON.stringify(payload);
    }
  };
}
