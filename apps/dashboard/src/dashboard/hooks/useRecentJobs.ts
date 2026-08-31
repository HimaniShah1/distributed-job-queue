import { useQuery } from '@apollo/client/react';

import { RECENT_JOBS_QUERY } from '../../graphql/queries/recent-jobs';
import { AUTO_SYNC_POLL_INTERVAL_MS, RECENT_JOBS_LIMIT } from '../constants/dashboard';

export function useRecentJobs(autoSync: boolean) {
  const { data, previousData, loading, error } = useQuery(RECENT_JOBS_QUERY, {
    variables: { limit: RECENT_JOBS_LIMIT },
    pollInterval: autoSync ? AUTO_SYNC_POLL_INTERVAL_MS : 0,
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });

  const jobs = data?.recentJobs ?? (error ? previousData?.recentJobs : undefined);

  return {
    jobs,
    loading: loading && !jobs,
    error,
  };
}
