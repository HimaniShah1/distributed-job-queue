import { pool } from "../db/pool.js";

import type { Job } from "../types/jobs.js";

export const failJob = async (
  jobId: string,
  leaseId: string,
  errorMessage: string
): Promise<Job | null> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const jobResult = await client.query<Job>(
      `
        SELECT *
        FROM jobs
        WHERE
          id = $1
          AND lease_id = $2
          AND status = 'processing'
        FOR UPDATE;
      `,
      [jobId, leaseId]
    );

    if (jobResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return null;
    }

    const job = jobResult.rows[0];

    const shouldRetry = job.attempt_number < job.max_attempts;

    const updatedJobResult = await client.query<Job>(
      shouldRetry
        ? `
          UPDATE jobs
          SET
            status = 'pending',
            run_at = NOW() + INTERVAL '10 seconds',
            worker_id = NULL,
            lease_id = NULL,
            visibility_timeout_at = NULL,
            last_error = $2,
            updated_at = NOW()
          WHERE id = $1
          RETURNING *;
        `
        : `
          UPDATE jobs
          SET
            status = 'failed',
            failed_at = NOW(),
            visibility_timeout_at = NULL,
            last_error = $2,
            updated_at = NOW()
          WHERE id = $1
          RETURNING *;
        `,
      [jobId, errorMessage]
    );

    await client.query(
      `
        UPDATE job_attempts
        SET
          status = 'failed',
          error_message = $2,
          ended_at = NOW()
        WHERE lease_id = $1;
      `,
      [leaseId, errorMessage]
    );

    await client.query("COMMIT");

    return updatedJobResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
};