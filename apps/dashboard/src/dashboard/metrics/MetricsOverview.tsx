import type { ErrorLike } from '@apollo/client';

import type { QueueMetricsQuery } from '../../gql/graphql';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricSection } from './MetricSection';
import { MetricRow, type MetricTone } from './MetricRow';
import { LatencySection } from './LatencySection';
import { formatCount, formatDuration, formatPercent, formatRate } from './format';

type QueueMetrics = QueueMetricsQuery['queueMetrics'];

interface MetricRowConfig {
  label: string;
  getValue: (metrics: QueueMetrics) => string;
  getTone?: (metrics: QueueMetrics) => MetricTone;
}

const QUEUE_HEALTH_ROWS: MetricRowConfig[] = [
  {
    label: 'DLQ',
    getValue: (m) => formatCount(m.health.dlqCount),
    getTone: (m) => (m.health.dlqCount > 0 ? 'error' : 'default'),
  },
  {
    label: 'Retryable Failures',
    getValue: (m) => formatCount(m.health.retryableFailedCount),
    getTone: (m) => (m.health.retryableFailedCount > 0 ? 'warning' : 'default'),
  },
  {
    label: 'Oldest Pending',
    getValue: (m) => formatDuration(m.health.oldestPendingAgeSeconds),
  },
  {
    label: 'Expired Processing',
    getValue: (m) => formatCount(m.health.expiredProcessingCount),
    getTone: (m) => (m.health.expiredProcessingCount > 0 ? 'error' : 'default'),
  },
];

const RELIABILITY_ROWS: MetricRowConfig[] = [
  {
    label: 'Success Rate',
    getValue: (m) => formatPercent(m.reliability.successRate),
    getTone: () => 'success',
  },
  {
    label: 'Failure Rate',
    getValue: (m) => formatPercent(m.reliability.failureRate),
    getTone: (m) => ((m.reliability.failureRate ?? 0) > 0 ? 'error' : 'default'),
  },
  {
    label: 'Retry Rate',
    getValue: (m) => formatPercent(m.reliability.retryRate),
    getTone: (m) => ((m.reliability.retryRate ?? 0) > 0 ? 'warning' : 'default'),
  },
];

const THROUGHPUT_ROWS: MetricRowConfig[] = [
  { label: 'Created / min', getValue: (m) => formatRate(m.throughput.createdPerMinute) },
  { label: 'Claimed / min', getValue: (m) => formatRate(m.throughput.claimedPerMinute) },
  {
    label: 'Completed / min',
    getValue: (m) => formatRate(m.throughput.completedPerMinute),
    getTone: () => 'success',
  },
  {
    label: 'Failed / min',
    getValue: (m) => formatRate(m.throughput.failedPerMinute),
    getTone: (m) => (m.throughput.failedPerMinute > 0 ? 'error' : 'default'),
  },
];

const DATABASE_ROWS: MetricRowConfig[] = [
  { label: 'Total Connections', getValue: (m) => formatCount(m.pool.totalConnections) },
  { label: 'Idle Connections', getValue: (m) => formatCount(m.pool.idleConnections) },
  {
    label: 'Waiting Clients',
    getValue: (m) => formatCount(m.pool.waitingClients),
    getTone: (m) => (m.pool.waitingClients > 0 ? 'warning' : 'default'),
  },
];

function ConfiguredSection({ title, rows, metrics }: { title: string; rows: MetricRowConfig[]; metrics: QueueMetrics }) {
  return (
    <MetricSection title={title}>
      {rows.map((row) => (
        <MetricRow
          key={row.label}
          label={row.label}
          value={row.getValue(metrics)}
          tone={row.getTone?.(metrics)}
        />
      ))}
    </MetricSection>
  );
}

const SECTION_SKELETON_KEYS = ['health', 'latency', 'reliability', 'throughput', 'database'] as const;

interface MetricsOverviewProps {
  metrics: QueueMetrics | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
}

export function MetricsOverview({ metrics, loading, error }: MetricsOverviewProps) {
  if (error && !metrics) {
    return (
      <div role="alert" className="rounded-lg border border-error/40 bg-error/10 p-4 text-sm text-error">
        Failed to load queue metrics: {error.message}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy>
        {SECTION_SKELETON_KEYS.map((key) => (
          <div key={key} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <div role="status" className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          Couldn't refresh queue metrics — showing the last known values.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ConfiguredSection title="Queue Health" rows={QUEUE_HEALTH_ROWS} metrics={metrics} />
        <LatencySection latency={metrics.latency} />
        <ConfiguredSection title="Reliability" rows={RELIABILITY_ROWS} metrics={metrics} />
        <ConfiguredSection title="Throughput" rows={THROUGHPUT_ROWS} metrics={metrics} />
        <ConfiguredSection title="Database" rows={DATABASE_ROWS} metrics={metrics} />
      </div>
    </div>
  );
}
