import { getMetrics } from "../jobs/get-metrics";
import { getStats } from "../jobs/get-stats";

import type { QueueMetrics, QueueStats } from "../types/queue";

export class QueueEngine {
  async getStats(): Promise<QueueStats> {
    return getStats();
  }

  async getMetrics(): Promise<QueueMetrics> {
    return getMetrics();
  }
}