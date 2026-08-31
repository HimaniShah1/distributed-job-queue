import { pool } from "../db/pool";

import type {
  LatencyMetrics,
  PoolMetrics,
  QueueHealthMetrics,
  QueueMetrics,
  ReliabilityMetrics,
  ThroughputMetrics,
} from "../types/queue";

type Numeric = string | number | null;

const toCount = (value: Numeric): number => {
  return value === null ? 0 : Number(value);
};

const toNullableNumber = (value: Numeric): number | null => {
  return value === null ? null : Number(value);
};

const getQueueHealth = async (): Promise<QueueHealthMetrics> => {
  const result = await pool.query<{
    dlq_count: Numeric;
    retryable_failed_count: Numeric;
    oldest_pending_age_seconds: Numeric;
    expired_processing_count: Numeric;
  }>(`
    SELECT
      COUNT(*) FILTER (
        WHERE status = 'failed'
          AND attempt_number >= max_attempts
      ) AS dlq_count,

      COUNT(*) FILTER (
        WHERE status = 'failed'
          AND attempt_number < max_attempts
      ) AS retryable_failed_count,

      EXTRACT(EPOCH FROM (
        NOW() - MIN(created_at) FILTER (WHERE status = 'pending')
      )) AS oldest_pending_age_seconds,

      COUNT(*) FILTER (
        WHERE status = 'processing'
          AND visibility_timeout_at IS NOT NULL
          AND visibility_timeout_at < NOW()
      ) AS expired_processing_count

    FROM jobs;
  `);

  const row = result.rows[0];

  return {
    dlqCount: toCount(row.dlq_count),
    retryableFailedCount: toCount(row.retryable_failed_count),
    oldestPendingAgeSeconds: toNullableNumber(
      row.oldest_pending_age_seconds
    ),
    expiredProcessingCount: toCount(row.expired_processing_count),
  };
};

const getLatencyMetrics = async (): Promise<LatencyMetrics> => {
  const result = await pool.query<{
    avg_queue_wait: Numeric;
    p50_queue_wait: Numeric;
    p95_queue_wait: Numeric;
    p99_queue_wait: Numeric;
    avg_processing_time: Numeric;
    p50_processing_time: Numeric;
    p95_processing_time: Numeric;
    p99_processing_time: Numeric;
    avg_end_to_end: Numeric;
    p95_end_to_end: Numeric;
    p99_end_to_end: Numeric;
  }>(`
    SELECT
      EXTRACT(EPOCH FROM AVG(claimed_at - created_at) FILTER (
        WHERE claimed_at IS NOT NULL
      )) * 1000 AS avg_queue_wait,

      EXTRACT(EPOCH FROM PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY (claimed_at - created_at)
      ) FILTER (WHERE claimed_at IS NOT NULL)) * 1000 AS p50_queue_wait,

      EXTRACT(EPOCH FROM PERCENTILE_CONT(0.95) WITHIN GROUP (
        ORDER BY (claimed_at - created_at)
      ) FILTER (WHERE claimed_at IS NOT NULL)) * 1000 AS p95_queue_wait,

      EXTRACT(EPOCH FROM PERCENTILE_CONT(0.99) WITHIN GROUP (
        ORDER BY (claimed_at - created_at)
      ) FILTER (WHERE claimed_at IS NOT NULL)) * 1000 AS p99_queue_wait,

      EXTRACT(EPOCH FROM AVG(completed_at - claimed_at) FILTER (
        WHERE completed_at IS NOT NULL AND claimed_at IS NOT NULL
      )) * 1000 AS avg_processing_time,

      EXTRACT(EPOCH FROM PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY (completed_at - claimed_at)
      ) FILTER (
        WHERE completed_at IS NOT NULL AND claimed_at IS NOT NULL
      )) * 1000 AS p50_processing_time,

      EXTRACT(EPOCH FROM PERCENTILE_CONT(0.95) WITHIN GROUP (
        ORDER BY (completed_at - claimed_at)
      ) FILTER (
        WHERE completed_at IS NOT NULL AND claimed_at IS NOT NULL
      )) * 1000 AS p95_processing_time,

      EXTRACT(EPOCH FROM PERCENTILE_CONT(0.99) WITHIN GROUP (
        ORDER BY (completed_at - claimed_at)
      ) FILTER (
        WHERE completed_at IS NOT NULL AND claimed_at IS NOT NULL
      )) * 1000 AS p99_processing_time,

      EXTRACT(EPOCH FROM AVG(completed_at - created_at) FILTER (
        WHERE completed_at IS NOT NULL
      )) * 1000 AS avg_end_to_end,

      EXTRACT(EPOCH FROM PERCENTILE_CONT(0.95) WITHIN GROUP (
        ORDER BY (completed_at - created_at)
      ) FILTER (WHERE completed_at IS NOT NULL)) * 1000 AS p95_end_to_end,

      EXTRACT(EPOCH FROM PERCENTILE_CONT(0.99) WITHIN GROUP (
        ORDER BY (completed_at - created_at)
      ) FILTER (WHERE completed_at IS NOT NULL)) * 1000 AS p99_end_to_end

    FROM jobs;
  `);

  const row = result.rows[0];

  return {
    avgQueueWaitMs: toNullableNumber(row.avg_queue_wait),
    p50QueueWaitMs: toNullableNumber(row.p50_queue_wait),
    p95QueueWaitMs: toNullableNumber(row.p95_queue_wait),
    p99QueueWaitMs: toNullableNumber(row.p99_queue_wait),

    avgProcessingTimeMs: toNullableNumber(row.avg_processing_time),
    p50ProcessingTimeMs: toNullableNumber(row.p50_processing_time),
    p95ProcessingTimeMs: toNullableNumber(row.p95_processing_time),
    p99ProcessingTimeMs: toNullableNumber(row.p99_processing_time),

    avgEndToEndMs: toNullableNumber(row.avg_end_to_end),
    p95EndToEndMs: toNullableNumber(row.p95_end_to_end),
    p99EndToEndMs: toNullableNumber(row.p99_end_to_end),
  };
};

const getReliabilityMetrics = async (): Promise<ReliabilityMetrics> => {
  const result = await pool.query<{
    completed_count: Numeric;
    failed_count: Numeric;
    retried_terminal_count: Numeric;
  }>(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
      COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
      COUNT(*) FILTER (
        WHERE status IN ('completed', 'failed') AND attempt_number > 1
      ) AS retried_terminal_count
    FROM jobs;
  `);

  const row = result.rows[0];

  const completed = toCount(row.completed_count);
  const failed = toCount(row.failed_count);
  const retriedTerminal = toCount(row.retried_terminal_count);

  const terminalCount = completed + failed;

  return {
    successRate: terminalCount === 0 ? null : completed / terminalCount,
    failureRate: terminalCount === 0 ? null : failed / terminalCount,
    retryRate: terminalCount === 0 ? null : retriedTerminal / terminalCount,
  };
};

const THROUGHPUT_WINDOW = "1 minute";

const getThroughputMetrics = async (): Promise<ThroughputMetrics> => {
  const result = await pool.query<{
    created_per_minute: Numeric;
    claimed_per_minute: Numeric;
    completed_per_minute: Numeric;
    failed_per_minute: Numeric;
  }>(`
    SELECT
      COUNT(*) FILTER (
        WHERE created_at >= NOW() - INTERVAL '${THROUGHPUT_WINDOW}'
      ) AS created_per_minute,

      COUNT(*) FILTER (
        WHERE claimed_at >= NOW() - INTERVAL '${THROUGHPUT_WINDOW}'
      ) AS claimed_per_minute,

      COUNT(*) FILTER (
        WHERE completed_at >= NOW() - INTERVAL '${THROUGHPUT_WINDOW}'
      ) AS completed_per_minute,

      COUNT(*) FILTER (
        WHERE failed_at >= NOW() - INTERVAL '${THROUGHPUT_WINDOW}'
      ) AS failed_per_minute

    FROM jobs;
  `);

  const row = result.rows[0];

  return {
    createdPerMinute: toCount(row.created_per_minute),
    claimedPerMinute: toCount(row.claimed_per_minute),
    completedPerMinute: toCount(row.completed_per_minute),
    failedPerMinute: toCount(row.failed_per_minute),
  };
};

const getPoolMetrics = (): PoolMetrics => {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount,
  };
};

export const getMetrics = async (): Promise<QueueMetrics> => {
  const [health, latency, reliability, throughput] = await Promise.all([
    getQueueHealth(),
    getLatencyMetrics(),
    getReliabilityMetrics(),
    getThroughputMetrics(),
  ]);

  return {
    health,
    latency,
    reliability,
    throughput,
    pool: getPoolMetrics(),
  };
};
