import { startWorker } from "../worker/worker";

import { seedJobs } from "./helpers/seed-jobs";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const main = async (): Promise<void> => {
  await seedJobs([
    {
  processingTimeMs: 30000,
  shouldFail: false,
}
  ]);

  console.log("Starting worker...");

  await startWorker("worker-1", async (job) => {
    const payload = job.payload as {
      processingTimeMs?: number;
      shouldFail?: boolean;
    };

    console.log(`Processing ${job.id}`);

    await sleep(payload.processingTimeMs ?? 100);

    if (payload.shouldFail) {
      throw new Error("Intentional failure");
    }

    console.log(`Completed ${job.id}`);
  });
};

void main();