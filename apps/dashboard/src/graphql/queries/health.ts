import { graphql } from '../../gql';

export const HEALTH_QUERY = graphql(`
  query Health {
    health {
      status
      uptime
    }
  }
`);