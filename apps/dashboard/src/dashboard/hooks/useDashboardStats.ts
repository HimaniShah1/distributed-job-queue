import { useQuery } from '@apollo/client/react';

import { DASHBOARD_STATS_QUERY } from '../../graphql/queries/dashboard-stats';

export function useDashboardStats() {
  const { data, loading, error } = useQuery(DASHBOARD_STATS_QUERY);

  return {
    stats: data?.dashboardStats,
    loading,
    error,
  };
}
