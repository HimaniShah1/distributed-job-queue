import { Activity, Clock, CircleCheck, TriangleAlert, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { DashboardStatsQuery } from '../../gql/graphql';
import { useDashboardStats } from '../hooks/useDashboardStats';
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

export function KPIGrid() {
  const { stats, loading, error } = useDashboardStats();

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-error/40 bg-error/10 p-4 text-sm text-error">
        Failed to load dashboard stats: {error.message}
      </div>
    );
  }

  return (
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
  );
}
