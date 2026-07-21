export const schema = /* GraphQL */ `
  type Health {
    status: String!
    uptime: Float!
  }

  type JobStats {
    pending: Int!
    processing: Int!
    completed: Int!
    failed: Int!
  }

  type WorkerStats {
    active: Int!
  }

  type DashboardStats {
    jobs: JobStats!
    workers: WorkerStats!
  }

  type Query {
    health: Health!
    dashboardStats: DashboardStats!
  }
`;
