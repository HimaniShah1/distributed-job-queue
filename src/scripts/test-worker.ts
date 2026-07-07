import { startWorker } from "../worker/worker";

import { seedJobs } from "./helpers/seed-jobs";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const main = async (): Promise<void> => {
  //   await seedJobs([
  //     {
  //   processingTimeMs: 30000,
  //   shouldFail: false,
  // }
  //   ]);

  const workerId = process.argv[2] ?? "worker-1";

  console.log("Starting worker...");

  await startWorker(workerId, async (job) => {
    const payload = job.payload as {
      processingTimeMs?: number;
      shouldFail?: boolean;
    };

    console.log(`[${workerId}] Processing ${job.id}`);

    await sleep(payload.processingTimeMs ?? 100);

    if (payload.shouldFail) {
      throw new Error("Intentional failure");
    }

    console.log(`[${workerId}] Completed ${job.id}`);
  });
};

void main();
