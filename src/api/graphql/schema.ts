export const schema = /* GraphQL */ `
  type Health {
    status: String!
    uptime: Float!
  }

  type Query {
    health: Health!
  }
`;