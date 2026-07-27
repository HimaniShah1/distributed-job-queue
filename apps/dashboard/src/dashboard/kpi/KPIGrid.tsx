import { Activity, Clock, CircleCheck, TriangleAlert, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ErrorLike } from '@apollo/client';

import type { DashboardStatsQuery } from '../../gql/graphql';
import { StatCard, type StatCardTone } from './StatCard';

type DashboardStats = DashboardStatsQuery['dashboardStats'];

interface KPICardConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  tone: StatCardTone;
  getValue: (stats: DashboardStats) => number;
}

const KPI_CARDS: KPICardConfig[] = [
  { key: 'pending', label: 'Pending Jobs', icon: Clock, tone: 'warning', getValue: (stats) => stats.jobs.pending },
  { key: 'processing', label: 'Processing', icon: Activity, tone: 'warning', getValue: (stats) => stats.jobs.processing },
  { key: 'completed', label: 'Completed', icon: CircleCheck, tone: 'success', getValue: (stats) => stats.jobs.completed },
  { key: 'failed', label: 'Failed Jobs', icon: TriangleAlert, tone: 'error', getValue: (stats) => stats.jobs.failed },
  { key: 'workers', label: 'Active Workers', icon: Users, tone: 'info', getValue: (stats) => stats.workers.active },
];

interface KPIGridProps {
  stats: DashboardStats | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
}

export function KPIGrid({ stats, loading, error }: KPIGridProps) {
  if (error && !stats) {
    return (
      <div role="alert" className="rounded-lg border border-error/40 bg-error/10 p-4 text-sm text-error">
        Failed to load dashboard stats: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && stats ? (
        <div role="status" className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          Couldn't refresh dashboard stats — showing the last known values.
        </div>
      ) : null}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
        aria-busy={loading}
      >
        {KPI_CARDS.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            icon={card.icon}
            tone={card.tone}
            value={stats ? card.getValue(stats) : undefined}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
