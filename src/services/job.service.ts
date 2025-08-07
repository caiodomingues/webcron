import { Job, IJob } from "../models/job";
import { Manager } from "../core/manager";

export class JobService {
  constructor(private manager: Manager) {}

  async addJob(jobData: IJob): Promise<Job> {
    const job = new Job(jobData);
    await this.manager.addJob(job);
    return job;
  }

  async retryJob(jobId: string): Promise<Job[]> {
    return this.manager.retryJob(jobId) as Promise<Job[]>;
  }

  async removeJob(jobId: string): Promise<Job[]> {
    return this.manager.removeJob(jobId) as Promise<Job[]>;
  }
}
