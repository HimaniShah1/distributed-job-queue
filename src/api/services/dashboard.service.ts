import { queueEngine } from "../../queue";

import type { QueueStats } from "../../types/queue";

class DashboardService {
  async getDashboardStats(): Promise<QueueStats> {
    return queueEngine.getStats();
  }
}

export const dashboardService = new DashboardService();