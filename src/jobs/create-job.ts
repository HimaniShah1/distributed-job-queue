import { randomUUID } from "crypto";

import { pool } from "../db/pool.js";

import type {
  CreateJobInput,
  Job,
} from "../types/jobs";

export const createJob = async (
  input: CreateJobInput
): Promise<Job> => {
  const {
    queueName,
    payload,
    runAt,
    maxAttempts = 3,
    idempotencyKey,
  } = input;

  if (idempotencyKey) {
    const existingJob = await pool.query<Job>(
      `
        SELECT *
        FROM jobs
        WHERE idempotency_key = $1
      `,
      [idempotencyKey]
    );

    if (existingJob.rowCount) {
      return existingJob.rows[0];
    }
  }

  const result = await pool.query<Job>(
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
    ]
  );

  return result.rows[0];
};