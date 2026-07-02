import { claimJob } from "../jobs/claim-job.js";
import { completeJob } from "../jobs/complete-job.js";
import { failJob } from "../jobs/fail-job.js";
import { heartbeatJob } from "../jobs/heartbeat-job.js";

import type { Job } from "../types/jobs.js";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export type JobProcessor = (job: Job) => Promise<void>;

export const processNextJob = async (
  workerId: string,
  processor: JobProcessor
): Promise<boolean> => {
  const job = await claimJob(workerId);

  if (!job) {
    return false;
  }

  const heartbeat = setInterval(async () => {
  const alive = await heartbeatJob(
    job.id,
    job.lease_id!
  );

  if (!alive) {
    clearInterval(heartbeat);
    return;
  }
}, 2000);

  try {
    await processor(job);

    await completeJob(job.id, job.lease_id!);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

   const failedJob = await failJob(
      job.id,
      job.lease_id!,
      errorMessage
    );

    console.log(
      `[FAILED] ${failedJob?.id} -> ${failedJob?.status} (attempt ${failedJob?.attempt_number})`
    );

  } finally {
    clearInterval(heartbeat);
  }

  return true;
};

export const startWorker = async (
  workerId: string,
  processor: JobProcessor
): Promise<never> => {
  while (true) {
    const processed = await processNextJob(
      workerId,
      processor
    );

    if (!processed) {
      await sleep(1000);
    }
  }
};

