import { useState, type ReactNode } from 'react';
import type { ErrorLike } from '@apollo/client';

import type { DashboardStatsQuery, QueueMetricsQuery, RecentJobsQuery } from '../../gql/graphql';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useRecentJobs } from '../hooks/useRecentJobs';

interface DashboardContentProps {
  stats: DashboardStatsQuery['dashboardStats'] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
  metrics: QueueMetricsQuery['queueMetrics'] | undefined;
  metricsLoading: boolean;
  metricsError: ErrorLike | undefined;
  recentJobs: RecentJobsQuery['recentJobs'] | undefined;
  recentJobsLoading: boolean;
  recentJobsError: ErrorLike | undefined;
}

interface DashboardLayoutProps {
  children: ReactNode | ((props: DashboardContentProps) => ReactNode);
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [autoSync, setAutoSync] = useState(true);
  const { stats, loading, error, lastUpdatedAt } = useDashboardStats(autoSync);
  const { metrics, loading: metricsLoading, error: metricsError } = useDashboardMetrics(autoSync);
  const { jobs: recentJobs, loading: recentJobsLoading, error: recentJobsError } = useRecentJobs(autoSync);

  return (
    <div className="flex min-h-svh w-full bg-background text-foreground">
      <Sidebar lastUpdatedAt={lastUpdatedAt} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header autoSync={autoSync} onAutoSyncChange={setAutoSync} />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
          {typeof children === 'function'
            ? children({
                stats,
                loading,
                error,
                metrics,
                metricsLoading,
                metricsError,
                recentJobs,
                recentJobsLoading,
                recentJobsError,
              })
            : children}
        </main>
      </div>
    </div>
  );
}
