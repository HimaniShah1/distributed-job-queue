import { pool } from "../db/pool";

import type { Job } from "../types/jobs";

export const getRecentJobs = async (limit = 10): Promise<Job[]> => {
  const result = await pool.query<Job>(
    `
      SELECT *
      FROM jobs
      ORDER BY created_at DESC
      LIMIT $1;
    `,
    [limit]
  );

  return result.rows;
};
