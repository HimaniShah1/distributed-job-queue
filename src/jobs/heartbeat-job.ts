import { pool } from "../db/pool.js";

export const heartbeatJob = async (
  jobId: string,
  leaseId: string
): Promise<boolean> => {
  const result = await pool.query(
    `
      UPDATE jobs
      SET
        visibility_timeout_at = NOW() + INTERVAL '10 seconds',
        updated_at = NOW()
      WHERE
        id = $1
        AND lease_id = $2
        AND status = 'processing'
      RETURNING id;
    `,
    [jobId, leaseId]
  );

  return result.rowCount === 1;
};