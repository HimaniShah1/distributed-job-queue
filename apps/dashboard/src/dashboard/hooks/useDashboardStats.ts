import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { NetworkStatus } from '@apollo/client';

import { DASHBOARD_STATS_QUERY } from '../../graphql/queries/dashboard-stats';
import { AUTO_SYNC_POLL_INTERVAL_MS } from '../constants/dashboard';

export function useDashboardStats(autoSync: boolean) {
  const { data, loading, error, networkStatus } = useQuery(DASHBOARD_STATS_QUERY, {
    pollInterval: autoSync ? AUTO_SYNC_POLL_INTERVAL_MS : 0,
    notifyOnNetworkStatusChange: true,
  });

  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (networkStatus === NetworkStatus.ready) {
      setLastUpdatedAt(new Date());
    }
  }, [networkStatus]);

  return {
    stats: data?.dashboardStats,
    loading: loading && !data,
    error,
    lastUpdatedAt,
  };
}
