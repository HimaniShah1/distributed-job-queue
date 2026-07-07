import { randomUUID } from "crypto";

import { pool } from "../db/pool";

import type { CreateJobInput, Job } from "../types/jobs";

export const createJob = async (input: CreateJobInput): Promise<Job> => {
  const { queueName, payload, runAt, maxAttempts = 3, idempotencyKey } = input;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /** Don't create duplicate jobs if an idempotency key already exists */
    if (idempotencyKey) {
      const existingJob = await client.query<Job>(
        `
        SELECT *
        FROM jobs
        WHERE idempotency_key = $1
      `,
        [idempotencyKey],
      );

      if (existingJob.rowCount) {
        await client.query("ROLLBACK");

        return existingJob.rows[0];
      }
    }

    /** Insert the new job */
    const result = await client.query<Job>(
      `
      INSERT INTO jobs (
        id,
        queue_name,
        payload,
        status,
        run_at,
        attempt_number,
        max_attempts,
        idempotency_key
      )
      VALUES (
        $1,
        $2,
        $3,
        'pending',
        $4,
        0,
        $5,
        $6
      )
      RETURNING *
    `,
      [
        randomUUID(),
        queueName,
        payload,
        runAt ?? new Date(),
        maxAttempts,
        idempotencyKey ?? null,
      ],
    );

    /** Wake any sleeping workers */
    await client.query("NOTIFY jobs_channel");

     /** Make the job visible before waking workers */
    await client.query("COMMIT");


    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
};
