import { useState, type ReactNode } from 'react';
import type { ErrorLike } from '@apollo/client';

import type { DashboardStatsQuery } from '../../gql/graphql';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface DashboardContentProps {
  stats: DashboardStatsQuery['dashboardStats'] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
}

interface DashboardLayoutProps {
  children: ReactNode | ((props: DashboardContentProps) => ReactNode);
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [autoSync, setAutoSync] = useState(true);
  const { stats, loading, error, lastUpdatedAt } = useDashboardStats(autoSync);

  return (
    <div className="flex min-h-svh w-full bg-background text-foreground">
      <Sidebar lastUpdatedAt={lastUpdatedAt} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header autoSync={autoSync} onAutoSyncChange={setAutoSync} />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
          {typeof children === 'function' ? children({ stats, loading, error }) : children}
        </main>
      </div>
    </div>
  );
}
