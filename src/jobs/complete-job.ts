import { pool } from "../db/pool.js";

import type { Job } from "../types/jobs";

export const completeJob = async (
  jobId: string,
  leaseId: string
): Promise<Job | null> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<Job>(
      `
        UPDATE jobs
        SET
          status = 'completed',
          completed_at = NOW(),
          visibility_timeout_at = NULL,
          updated_at = NOW()
        WHERE
          id = $1
          AND lease_id = $2
          AND status = 'processing'
        RETURNING *;
      `,
      [jobId, leaseId]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");

      return null;
    }

    const job = result.rows[0];

    await client.query(
      `
        UPDATE job_attempts
        SET
          status = 'completed',
          ended_at = NOW()
        WHERE lease_id = $1;
      `,
      [leaseId]
    );

    await client.query("COMMIT");

    console.dir(job, {
  depth: null,
});

    return job;
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
};