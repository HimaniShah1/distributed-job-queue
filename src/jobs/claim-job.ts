import { randomUUID } from "crypto";

import { pool } from "../db/pool";

import type { Job } from "../types/jobs";

export const claimJob = async (
  workerId: string
): Promise<Job | null> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const leaseId = randomUUID();

    const result = await client.query<Job>(
      `
        WITH claimed_job AS (
          SELECT id
          FROM jobs
          WHERE status = 'pending'
            AND run_at <= NOW()
          ORDER BY run_at
          FOR UPDATE SKIP LOCKED
          LIMIT 1
        )
        UPDATE jobs
        SET
          status = 'processing',
          worker_id = $1,
          lease_id = $2,
          claimed_at = NOW(),
          visibility_timeout_at = NOW() + INTERVAL '10 seconds',
          attempt_number = attempt_number + 1,
          updated_at = NOW()
        FROM claimed_job
        WHERE jobs.id = claimed_job.id
        RETURNING jobs.*;
      `,
      [workerId, leaseId]
    );

    if (result.rowCount === 0) {
      await client.query("COMMIT");

      return null;
    }

    const job = result.rows[0];

    await client.query(
      `
        INSERT INTO job_attempts (
          id,
          job_id,
          attempt_number,
          worker_id,
          lease_id,
          status,
          started_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          'processing',
          NOW()
        )
      `,
      [
        randomUUID(),
        job.id,
        job.attempt_number,
        job.worker_id,
        job.lease_id,
      ]
    );

    await client.query("COMMIT");

    return job;
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
};