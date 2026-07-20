export const schema = /* GraphQL */ `
  type Health {
    status: String!
    uptime: Float!
  }

  type DashboardStats {
  pendingJobs: Int!
  processingJobs: Int!
  completedJobs: Int!
  failedJobs: Int!
  activeWorkers: Int!
}

  type Query {
    health: Health!
    dashboardStats: DashboardStats!
  }
`;