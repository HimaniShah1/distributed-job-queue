import { pool } from "../db/pool.js";

import type { Job } from "../types/jobs.js";

export const reapExpiredJobs = async (): Promise<Job[]> => {
  const result = await pool.query<Job>(
    `
      UPDATE jobs
      SET
        status = 'pending',
        worker_id = NULL,
        lease_id = NULL,
        visibility_timeout_at = NULL,
        updated_at = NOW(),
        run_at = NOW()
      WHERE
        status = 'processing'
        AND visibility_timeout_at < NOW()
      RETURNING *;
    `
  );

  return result.rows;
};