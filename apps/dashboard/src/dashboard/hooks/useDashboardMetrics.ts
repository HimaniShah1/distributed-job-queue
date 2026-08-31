import { useQuery } from '@apollo/client/react';

import { QUEUE_METRICS_QUERY } from '../../graphql/queries/queue-metrics';
import { AUTO_SYNC_POLL_INTERVAL_MS } from '../constants/dashboard';

export function useDashboardMetrics(autoSync: boolean) {
  const { data, previousData, loading, error } = useQuery(QUEUE_METRICS_QUERY, {
    pollInterval: autoSync ? AUTO_SYNC_POLL_INTERVAL_MS : 0,
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });

  const metrics = data?.queueMetrics ?? (error ? previousData?.queueMetrics : undefined);

  return {
    metrics,
    loading: loading && !metrics,
    error,
  };
}
