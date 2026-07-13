import { startWorker } from "../worker/worker";

import type { Job } from "../types/jobs.js";

const workerId = process.argv[2] ?? "worker-1";

/** Empty processor because we want to benchmark the queue itself */
const processor: (job: Job) => Promise<void> = async () => {};

const main = async (): Promise<void> => {
  await startWorker(
    workerId,
    processor,
    {
      benchmark: true,
    },
  );
};

void main();