import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { NetworkStatus } from '@apollo/client';

import { DASHBOARD_STATS_QUERY } from '../../graphql/queries/dashboard-stats';
import { AUTO_SYNC_POLL_INTERVAL_MS } from '../constants/dashboard';

export function useDashboardStats(autoSync: boolean) {
  const { data, previousData, loading, error, networkStatus } = useQuery(DASHBOARD_STATS_QUERY, {
    pollInterval: autoSync ? AUTO_SYNC_POLL_INTERVAL_MS : 0,
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });

  const [previousNetworkStatus, setPreviousNetworkStatus] = useState<NetworkStatus | undefined>(
    undefined,
  );
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | undefined>(undefined);

  // This is React's documented "adjust state when a value changes during render" pattern
  // (see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes),
  // not a bug. It must NOT be moved into a useEffect — this project's react-hooks/set-state-in-effect
  // rule forbids setting state from an effect. It must NOT be replaced with a useRef mutated during
  // render either — this project's react-hooks/refs rule forbids that too. It cannot loop: the
  // condition below is false on the immediate re-render the setState call triggers, so it converges
  // after exactly one extra render.
  if (networkStatus !== previousNetworkStatus) {
    setPreviousNetworkStatus(networkStatus);
    if (networkStatus === NetworkStatus.ready) {
      setLastUpdatedAt(new Date());
    }
  }

  const stats = data?.dashboardStats ?? (error ? previousData?.dashboardStats : undefined);

  return {
    stats,
    loading: loading && !stats,
    error,
    lastUpdatedAt,
  };
}
