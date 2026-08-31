import type { QueueMetricsQuery } from '../../gql/graphql';
import { MetricSection } from './MetricSection';
import { formatMs } from './format';

type LatencyMetrics = QueueMetricsQuery['queueMetrics']['latency'];

interface LatencyGroupRowProps {
  label: string;
  values: Array<{ label: string; value: string }>;
}

function LatencyGroupRow({ label, values }: LatencyGroupRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        {values.map((entry) => (
          <span key={entry.label} className="flex items-baseline gap-1">
            <span className="text-xs text-muted-foreground">{entry.label}</span>
            <span className="font-medium tabular-nums text-foreground">{entry.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

interface LatencySectionProps {
  latency: LatencyMetrics;
}

export function LatencySection({ latency }: LatencySectionProps) {
  return (
    <MetricSection title="Latency">
      <LatencyGroupRow
        label="Queue Wait"
        values={[
          { label: 'P50', value: formatMs(latency.p50QueueWaitMs) },
          { label: 'P95', value: formatMs(latency.p95QueueWaitMs) },
          { label: 'P99', value: formatMs(latency.p99QueueWaitMs) },
        ]}
      />
      <LatencyGroupRow
        label="Processing"
        values={[
          { label: 'P50', value: formatMs(latency.p50ProcessingTimeMs) },
          { label: 'P95', value: formatMs(latency.p95ProcessingTimeMs) },
          { label: 'P99', value: formatMs(latency.p99ProcessingTimeMs) },
        ]}
      />
      <LatencyGroupRow
        label="End-to-End"
        values={[
          { label: 'P95', value: formatMs(latency.p95EndToEndMs) },
          { label: 'P99', value: formatMs(latency.p99EndToEndMs) },
        ]}
      />
    </MetricSection>
  );
}
