import { randomUUID } from "crypto";

export interface IJob {
  id?: string;
  callback: string;
  payload?: string | object;
  recurrency?: number;
  limit?: number;
  queueId?: string;
}

interface IAnalytics {
  success: boolean;
}

export class Job {
  public id: string;
  public queueId: string | null;
  public callback: string;
  public payload?: string;

  public scheduled: number;
  public failed: number;

  public previousCall: Date | null;
  public nextCall: Date | null;
  public recurrency: number;
  public limit: number;

  constructor({ id, callback, payload, recurrency = 0, limit = 0, queueId }: IJob) {
    this.id = id ?? randomUUID();
    this.callback = callback;
    this.recurrency = recurrency;
    this.limit = limit;
    this.queueId = queueId ?? null;
    this.previousCall = null;
    this.nextCall = null;
    this.scheduled = 0;
    this.failed = 0;
    this.setNextCall();
    if (payload !== undefined) {
      this.payload = Job.normalize(payload);
    }
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

  static normalize(payload: string | object): string {
    if (typeof payload === "string") {
      return payload;
    } else {
      return JSON.stringify(payload);
    }
  }
}
