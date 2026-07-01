import { createJob } from "../../jobs/create-job";

import type { Job } from "../../types/jobs";

export type SeedJob = {
  processingTimeMs?: number;
  shouldFail?: boolean;
};

export const seedJobs = async (
  jobs: SeedJob[]
): Promise<Job[]> => {
  const createdJobs: Job[] = [];

  for (const job of jobs) {
    createdJobs.push(
      await createJob({
        queueName: "emails",
        payload: job,
      })
    );
  }

  return createdJobs;
};