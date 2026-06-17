export type CreateJobInput = {
  queueName: string;
  payload: Record<string, unknown>;
  runAt?: Date;
  maxAttempts?: number;
  idempotencyKey?: string;
};

export type Job = {
  id: string;

  queue_name: string;
  payload: Record<string, unknown>;

  status: string;

  run_at: Date;

  worker_id: string | null;
  lease_id: string | null;
  visibility_timeout_at: Date | null;

  attempt_number: number;
  max_attempts: number;

  idempotency_key: string | null;

  last_error: string | null;

  claimed_at: Date | null;
  completed_at: Date | null;
  failed_at: Date | null;

  created_at: Date;
  updated_at: Date;
};