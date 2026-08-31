import { graphql } from '../../gql';

export const RECENT_JOBS_QUERY = graphql(`
  query RecentJobs($limit: Int) {
    recentJobs(limit: $limit) {
      id
      queueName
      status
      attemptNumber
      maxAttempts
      lastError
      createdAt
      updatedAt
    }
  }
`);
