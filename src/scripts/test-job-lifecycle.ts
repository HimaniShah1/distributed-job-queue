import { createJob } from "../jobs/create-job";
import { claimJob } from "../jobs/claim-job";
import { completeJob } from "../jobs/complete-job";

const main = async (): Promise<void> => {
  const createdJob = await createJob({
    queueName: "emails",
    payload: {
      to: "test@example.com",
      subject: "Hello",
    },
  });

  console.log("Created Job");
  console.table({
    id: createdJob.id,
    status: createdJob.status,
  });

  const claimedJob = await claimJob("worker-1");

  if (!claimedJob) {
    throw new Error("Failed to claim job");
  }

  console.log("Claimed Job");
  console.table({
    id: claimedJob.id,
    status: claimedJob.status,
    workerId: claimedJob.worker_id,
    leaseId: claimedJob.lease_id,
    attemptNumber: claimedJob.attempt_number,
  });

  const completedJob = await completeJob(
    claimedJob.id,
    claimedJob.lease_id as string
  );

  if (!completedJob) {
    throw new Error("Failed to complete job");
  }

  console.log("Completed Job");
  console.table({
    id: completedJob.id,
    status: completedJob.status,
    completedAt: completedJob.completed_at?.toISOString(),
  });
};

void main();