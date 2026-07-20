export interface DashboardStats {
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  activeWorkers: number;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    // TODO:
    // Replace this with:
    // return queueEngine.getStats();

    return {
      pendingJobs: 1234,
      processingJobs: 56,
      completedJobs: 12345,
      failedJobs: 78,
      activeWorkers: 8,
    };
  }
}

export const dashboardService = new DashboardService();