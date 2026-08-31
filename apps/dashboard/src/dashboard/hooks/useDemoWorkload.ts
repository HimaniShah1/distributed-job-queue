import { useState } from 'react';

import { useCreateJob } from './useCreateJob';

interface DemoJobSpec {
  processingTimeMs: number;
  shouldFail: boolean;
}

const DEMO_QUEUE_NAME = 'demo';

/**
 * Mirrors the payload shape the existing worker processor already understands
 * (see src/scripts/test-worker.ts / seed-jobs.ts): processingTimeMs controls
 * how long the worker sleeps, shouldFail makes it throw. A shouldFail job
 * fails identically on every attempt, so it deterministically exhausts its
 * retries and lands in the DLQ — a real, observable retry -> failure path
 * with no need to fake anything.
 */
const DEMO_JOB_SPECS: DemoJobSpec[] = [
  { processingTimeMs: 300, shouldFail: false },
  { processingTimeMs: 500, shouldFail: false },
  { processingTimeMs: 800, shouldFail: false },
  { processingTimeMs: 1200, shouldFail: false },
  { processingTimeMs: 1500, shouldFail: false },
  { processingTimeMs: 400, shouldFail: true },
  { processingTimeMs: 600, shouldFail: true },
  { processingTimeMs: 6000, shouldFail: false },
];

export interface DemoWorkloadResult {
  createdCount: number;
  failedCount: number;
  total: number;
}

export function useDemoWorkload() {
  const { createJob } = useCreateJob();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<DemoWorkloadResult | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const runDemoWorkload = async () => {
    setIsRunning(true);
    setError(undefined);
    setResult(undefined);

    try {
      const outcomes = await Promise.allSettled(
        DEMO_JOB_SPECS.map((spec) =>
          createJob({
            queueName: DEMO_QUEUE_NAME,
            payload: JSON.stringify(spec),
          }),
        ),
      );

      const createdCount = outcomes.filter((outcome) => outcome.status === 'fulfilled').length;
      const failedCount = outcomes.length - createdCount;

      setResult({ createdCount, failedCount, total: outcomes.length });

      if (failedCount > 0) {
        setError(`${failedCount} of ${outcomes.length} job(s) failed to submit.`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  return { runDemoWorkload, isRunning, result, error };
}
