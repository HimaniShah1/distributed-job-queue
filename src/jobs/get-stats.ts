import { pool } from "../db/pool";

import type { QueueStats } from "../types/queue";

export const getStats = async (): Promise<QueueStats> => {
  const result = await pool.query<{
    pending: string;
    processing: string;
    completed: string;
    failed: string;
    active_workers: string;
  }>(`
    SELECT
      COUNT(*) FILTER (
        WHERE status = 'pending'
      ) AS pending,

      COUNT(*) FILTER (
        WHERE status = 'processing'
      ) AS processing,

      COUNT(*) FILTER (
        WHERE status = 'completed'
      ) AS completed,

      COUNT(*) FILTER (
        WHERE status = 'failed'
      ) AS failed,

      COUNT(DISTINCT worker_id)
      FILTER (
        WHERE status = 'processing'
          AND worker_id IS NOT NULL
      ) AS active_workers

    FROM jobs;
  `);

  const row = result.rows[0];

  return {
    jobs: {
      pending: Number(row.pending),
      processing: Number(row.processing),
      completed: Number(row.completed),
      failed: Number(row.failed),
    },

    workers: {
      active: Number(row.active_workers),
    },
  };
};