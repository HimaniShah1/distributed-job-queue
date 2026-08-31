import { queueEngine } from "../../queue";

import type { CreateJobInput, Job } from "../../types/jobs";
import type { QueueMetrics, QueueStats } from "../../types/queue";

class DashboardService {
  async getDashboardStats(): Promise<QueueStats> {
    return queueEngine.getStats();
  }

  async getQueueMetrics(): Promise<QueueMetrics> {
    return queueEngine.getMetrics();
  }

  async createJob(input: CreateJobInput): Promise<Job> {
    return queueEngine.createJob(input);
  }

  async getRecentJobs(limit?: number): Promise<Job[]> {
    return queueEngine.getRecentJobs(limit);
  }
}

export const dashboardService = new DashboardService();