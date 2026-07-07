import { reapExpiredJobs } from "../jobs/reap-expired-jobs.js";

const main = async (): Promise<void> => {
  const jobs = await reapExpiredJobs();

  console.log(`Reclaimed ${jobs.length} job(s)`);

  console.table(
    jobs.map((job) => ({
      id: job.id,
      workerId: job.worker_id,
      status: job.status,
    }))
  );
};

void main();