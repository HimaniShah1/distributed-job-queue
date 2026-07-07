import { initializeListener, waitForNotification } from "../db/listener";
import { claimJob } from "../jobs/claim-job";
import { completeJob } from "../jobs/complete-job";
import { failJob } from "../jobs/fail-job";
import { heartbeatJob } from "../jobs/heartbeat-job";

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

  /** Keep extending the lease while this worker owns the job */
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
  /** Dedicated LISTEN connection for this worker */
  await initializeListener();

  while (true) {
    /** Drain the queue before going back to sleep */
    while (
      await processNextJob(
        workerId,
        processor
      )
    ) {}

    console.log(`[${workerId}] Waiting for work...`);

    /** Sleep until a producer notifies us, or periodically wake up as a safety net */
    await Promise.race([
      waitForNotification(),
      sleep(30000),
    ]);

    console.log(`[${workerId}] Woken up.`);
  }
};
