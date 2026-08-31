import { graphql } from '../../gql';

export const CREATE_JOB_MUTATION = graphql(`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      queueName
      status
      attemptNumber
      maxAttempts
      createdAt
    }
  }
`);
