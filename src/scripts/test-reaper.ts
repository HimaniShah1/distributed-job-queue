import { claimJob } from "../jobs/claim-job.js";
import { reapExpiredJobs } from "../jobs/reap-expired-jobs.js";

import { seedJobs } from "./helpers/seed-jobs.js";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const main = async (): Promise<void> => {
  await seedJobs([
    {
      processingTimeMs: 30000,
      shouldFail: false,
    },
  ]);

  const job = await claimJob("worker-1");

  if (!job) {
    throw new Error("Failed to claim job.");
  }

  console.log("Claimed job");

  console.table({
    id: job.id,
    status: job.status,
    leaseId: job.lease_id,
    visibilityTimeoutAt:
      job.visibility_timeout_at?.toISOString(),
  });

  console.log("Waiting for lease to expire...");

  await sleep(11_000);

  const reapedJobs = await reapExpiredJobs();

  console.log(`Reclaimed ${reapedJobs.length} job(s)`);

  console.table(
    reapedJobs.map((job) => ({
      id: job.id,
      status: job.status,
      workerId: job.worker_id,
      leaseId: job.lease_id,
      runAt: job.run_at?.toISOString(),
    }))
  );
};

void main();