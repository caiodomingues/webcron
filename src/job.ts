import { randomUUID } from "crypto";

export class Job {
  protected id: string;
  protected callback: string;
  public payload?: string;

  constructor(callback: string, payload?: string | Object) {
    this.id = randomUUID();
    this.callback = callback;

    if (payload) {
      this.payload = this.normalizePayload(payload);
    }
  }

  normalizePayload = (payload: string | Object) => {
    if (typeof payload === "string") {
      return payload;
    } else {
      return JSON.stringify(payload);
    }
  };
}
