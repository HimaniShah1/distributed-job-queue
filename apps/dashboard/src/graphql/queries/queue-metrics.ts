import { graphql } from '../../gql';

export const QUEUE_METRICS_QUERY = graphql(`
  query QueueMetrics {
    queueMetrics {
      health {
        dlqCount
        retryableFailedCount
        oldestPendingAgeSeconds
        expiredProcessingCount
      }
      latency {
        p50QueueWaitMs
        p95QueueWaitMs
        p99QueueWaitMs
        p50ProcessingTimeMs
        p95ProcessingTimeMs
        p99ProcessingTimeMs
        p95EndToEndMs
        p99EndToEndMs
      }
      reliability {
        successRate
        failureRate
        retryRate
      }
      throughput {
        createdPerMinute
        claimedPerMinute
        completedPerMinute
        failedPerMinute
      }
      pool {
        totalConnections
        idleConnections
        waitingClients
      }
    }
  }
`);
