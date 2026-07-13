import { performance } from "node:perf_hooks";
import { spawn, type ChildProcess } from "node:child_process";

import { pool } from "../db/pool.js";
import { seedJobs } from "../scripts/helpers/seed-jobs";

const JOB_COUNT = 100_000;
const WORKER_COUNT = 8;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const truncateTables = async (): Promise<void> => {
  await pool.query(`
    TRUNCATE job_attempts, jobs
    RESTART IDENTITY
    CASCADE
  `);
};

const getRemainingJobs = async (): Promise<number> => {
  const result = await pool.query<{
    count: string;
  }>(`
    SELECT COUNT(*) AS count
    FROM jobs
    WHERE status != 'completed'
  `);

  return Number(result.rows[0].count);
};

const spawnWorkers = (): ChildProcess[] => {
  const workers: ChildProcess[] = [];

  /** Start N independent worker processes */
  for (let index = 1; index <= WORKER_COUNT; index++) {
    workers.push(
      spawn(
       "node",
  [
    "dist/benchmark/benchmark-worker.js",
    `worker-${index}`,
  ],
  {
    stdio: "inherit",
  },
      ),
    );
  }

  return workers;
};

const stopWorkers = (workers: ChildProcess[]): void => {
  /** Cleanly stop every benchmark worker */
  for (const worker of workers) {
    worker.kill("SIGINT");
  }
};

const main = async (): Promise<void> => {
  const benchmarkStart = performance.now();

  console.log("Cleaning database...");

  const truncateStart = performance.now();
  await truncateTables();
  const truncateDuration = performance.now() - truncateStart;

  console.log(
    `✓ Truncate completed in ${(truncateDuration).toFixed(2)} ms`,
  );

  console.log(`Seeding ${JOB_COUNT} jobs...`);

  const seedStart = performance.now();
  await seedJobs(
    Array.from({ length: JOB_COUNT }, () => ({
      processingTimeMs: 0,
      shouldFail: false,
    })),
  );
  const seedDuration = performance.now() - seedStart;

  console.log(
    `✓ Seeding completed in ${(seedDuration).toFixed(2)} ms`,
  );

  console.log(`Starting ${WORKER_COUNT} worker(s)...`);

  const workerStart = performance.now();
  const workers = spawnWorkers();
  const workerSpawnDuration = performance.now() - workerStart;

  console.log(
    `✓ Spawned workers in ${(workerSpawnDuration).toFixed(2)} ms`,
  );

  const processingStart = performance.now();

  while (true) {
    const remainingJobs = await getRemainingJobs();

    if (remainingJobs === 0) {
      break;
    }

    await sleep(1000);
  }

  const processingDuration =
    performance.now() - processingStart;

  const shutdownStart = performance.now();
  stopWorkers(workers);
  const shutdownDuration =
    performance.now() - shutdownStart;

  const totalDuration =
    performance.now() - benchmarkStart;

  console.log();
  console.log("========== Benchmark ==========");

  console.table({
    Jobs: JOB_COUNT,
    Workers: WORKER_COUNT,
    "Truncate (ms)": truncateDuration.toFixed(2),
    "Seed (ms)": seedDuration.toFixed(2),
    "Spawn (ms)": workerSpawnDuration.toFixed(2),
    "Processing (ms)": processingDuration.toFixed(2),
    "Shutdown (ms)": shutdownDuration.toFixed(2),
    "Total (ms)": totalDuration.toFixed(2),
    "Throughput (jobs/sec)": (
      JOB_COUNT /
      (processingDuration / 1000)
    ).toFixed(2),
  });

  await pool.end();
};

void main();