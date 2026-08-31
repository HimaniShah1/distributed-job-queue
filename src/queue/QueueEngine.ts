import { createJob } from "../jobs/create-job";
import { getMetrics } from "../jobs/get-metrics";
import { getRecentJobs } from "../jobs/get-recent-jobs";
import { getStats } from "../jobs/get-stats";

import type { CreateJobInput, Job } from "../types/jobs";
import type { QueueMetrics, QueueStats } from "../types/queue";

export class QueueEngine {
  async getStats(): Promise<QueueStats> {
    return getStats();
  }

  async getMetrics(): Promise<QueueMetrics> {
    return getMetrics();
  }

  async createJob(input: CreateJobInput): Promise<Job> {
    return createJob(input);
  }

  async getRecentJobs(limit?: number): Promise<Job[]> {
    return getRecentJobs(limit);
  }
}