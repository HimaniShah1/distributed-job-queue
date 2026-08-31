export const schema = /* GraphQL */ `
  type Health {
    status: String!
    uptime: Float!
  }

  type JobStats {
    pending: Int!
    processing: Int!
    completed: Int!
    failed: Int!
  }

  type WorkerStats {
    active: Int!
  }

  type DashboardStats {
    jobs: JobStats!
    workers: WorkerStats!
  }

  type QueueHealthMetrics {
    dlqCount: Int!
    retryableFailedCount: Int!
    oldestPendingAgeSeconds: Float
    expiredProcessingCount: Int!
  }

  type LatencyMetrics {
    avgQueueWaitMs: Float
    p50QueueWaitMs: Float
    p95QueueWaitMs: Float
    p99QueueWaitMs: Float

    avgProcessingTimeMs: Float
    p50ProcessingTimeMs: Float
    p95ProcessingTimeMs: Float
    p99ProcessingTimeMs: Float

    avgEndToEndMs: Float
    p95EndToEndMs: Float
    p99EndToEndMs: Float
  }

  type ReliabilityMetrics {
    successRate: Float
    failureRate: Float
    retryRate: Float
  }

  type ThroughputMetrics {
    createdPerMinute: Int!
    claimedPerMinute: Int!
    completedPerMinute: Int!
    failedPerMinute: Int!
  }

  type PoolMetrics {
    totalConnections: Int!
    idleConnections: Int!
    waitingClients: Int!
  }

  type QueueMetrics {
    health: QueueHealthMetrics!
    latency: LatencyMetrics!
    reliability: ReliabilityMetrics!
    throughput: ThroughputMetrics!
    pool: PoolMetrics!
  }

  type Query {
    health: Health!
    dashboardStats: DashboardStats!
    queueMetrics: QueueMetrics!
  }
`;
