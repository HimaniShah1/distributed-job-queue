import { claimJob } from "../jobs/claim-job.js";
import { completeJob } from "../jobs/complete-job.js";
import { failJob } from "../jobs/fail-job.js";

import { seedJobs } from "./helpers/seed-jobs.js";

const main = async (): Promise<void> => {
  await seedJobs([
    {
      processingTimeMs: 100,
      shouldFail: false,
    },
  ]);

  const claimedJob = await claimJob("worker-1");

  if (!claimedJob) {
    throw new Error("Failed to claim job.");
  }

  console.log("Claimed Job");

  console.table({
    id: claimedJob.id,
    status: claimedJob.status,
    workerId: claimedJob.worker_id,
    leaseId: claimedJob.lease_id,
    attemptNumber: claimedJob.attempt_number,
  });

  const shouldFail = true;

  if (shouldFail) {
    const failedJob = await failJob(
      claimedJob.id,
      claimedJob.lease_id!,
      "SMTP server unavailable"
    );

    console.log("Failed Job");

    console.table({
      id: failedJob?.id,
      status: failedJob?.status,
      attemptNumber: failedJob?.attempt_number,
      runAt: failedJob?.run_at?.toISOString(),
    });

    return;
  }

  const completedJob = await completeJob(
    claimedJob.id,
    claimedJob.lease_id!
  );

  console.log("Completed Job");

  console.table({
    id: completedJob?.id,
    status: completedJob?.status,
    completedAt: completedJob?.completed_at?.toISOString(),
  });
};

void main();