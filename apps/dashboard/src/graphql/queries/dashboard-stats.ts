import { graphql } from '../../gql';

export const DASHBOARD_STATS_QUERY = graphql(`
  query DashboardStats {
    dashboardStats {
      jobs {
        pending
        processing
        completed
        failed
      }
      workers {
        active
      }
    }
  }
`);
