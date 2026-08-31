export interface QueueStats {
  jobs: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };

  workers: {
    active: number;
  };
}

export interface QueueHealthMetrics {
  /** status = 'failed' AND attempt_number >= max_attempts */
  dlqCount: number;
  /** status = 'failed' AND attempt_number < max_attempts */
  retryableFailedCount: number;
  /** NOW() - MIN(created_at) over pending jobs; null when there are none */
  oldestPendingAgeSeconds: number | null;
  /** status = 'processing' AND visibility_timeout_at < NOW() */
  expiredProcessingCount: number;
}

/** All latency values are in milliseconds. */
export interface LatencyMetrics {
  /** claimed_at - created_at, only where both exist */
  avgQueueWaitMs: number | null;
  p50QueueWaitMs: number | null;
  p95QueueWaitMs: number | null;
  p99QueueWaitMs: number | null;

  /** completed_at - claimed_at, only where both exist */
  avgProcessingTimeMs: number | null;
  p50ProcessingTimeMs: number | null;
  p95ProcessingTimeMs: number | null;
  p99ProcessingTimeMs: number | null;

  /** completed_at - created_at, only where both exist */
  avgEndToEndMs: number | null;
  p95EndToEndMs: number | null;
  p99EndToEndMs: number | null;
}

/**
 * All three rates share one denominator: terminal jobs, i.e. status IN
 * ('completed', 'failed'). A job stays 'pending' while it still has retries
 * left (see fail-job.ts) and only reaches 'failed' once it has none, so a
 * job's attempt_number is only "settled" once it's terminal — an in-flight
 * job (pending on a later attempt, or currently processing) hasn't yet
 * determined whether it "required" more than one attempt.
 *
 * successRate / failureRate: share of terminal jobs that ended in each outcome.
 * retryRate: share of terminal jobs whose attempt_number > 1, i.e. required
 * more than their first attempt to reach that terminal outcome.
 *
 * All three are null when there are no terminal jobs yet.
 */
export interface ReliabilityMetrics {
  successRate: number | null;
  failureRate: number | null;
  retryRate: number | null;
}

/** Counts within a trailing 1-minute window, evaluated at query time. */
export interface ThroughputMetrics {
  createdPerMinute: number;
  claimedPerMinute: number;
  completedPerMinute: number;
  failedPerMinute: number;
}

export interface PoolMetrics {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
}

export interface QueueMetrics {
  health: QueueHealthMetrics;
  latency: LatencyMetrics;
  reliability: ReliabilityMetrics;
  throughput: ThroughputMetrics;
  pool: PoolMetrics;
}