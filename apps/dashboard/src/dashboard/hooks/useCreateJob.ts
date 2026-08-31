import { useMutation } from '@apollo/client/react';

import { CREATE_JOB_MUTATION } from '../../graphql/mutations/create-job';

export interface CreateJobInput {
  queueName: string;
  payload: string;
  maxAttempts?: number;
}

export function useCreateJob() {
  const [mutate, { loading, error }] = useMutation(CREATE_JOB_MUTATION);

  const createJob = async (input: CreateJobInput) => {
    const result = await mutate({ variables: { input } });
    return result.data?.createJob;
  };

  return { createJob, loading, error };
}
