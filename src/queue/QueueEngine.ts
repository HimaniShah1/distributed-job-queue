import { getStats } from "../jobs/get-stats";

import type { QueueStats } from "../types/queue";

export class QueueEngine {
  async getStats(): Promise<QueueStats> {
    return getStats();
  }
}