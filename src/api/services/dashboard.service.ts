import { queueEngine } from "../../queue";

import type { QueueMetrics, QueueStats } from "../../types/queue";

class DashboardService {
  async getDashboardStats(): Promise<QueueStats> {
    return queueEngine.getStats();
  }

  async getQueueMetrics(): Promise<QueueMetrics> {
    return queueEngine.getMetrics();
  }
}

export const dashboardService = new DashboardService();