import { randomUUID } from "crypto";

import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { pool } from "../db/pool";

import { getMetrics } from "./get-metrics";

/**
 * These tests run against a real Postgres database (DATABASE_URL, same as the
 * project's existing manual scripts under src/scripts/) with migrations applied.
 * The jobs/job_attempts tables are cleared before each test.
 */

const resetJobs = async (): Promise<void> => {
  await pool.query("DELETE FROM job_attempts");
  await pool.query("DELETE FROM jobs");
};

type SeedJobOverrides = Partial<{
  status: "pending" | "processing" | "completed" | "failed";
  attemptNumber: number;
  maxAttempts: number;
  createdAt: Date;
  claimedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  visibilityTimeoutAt: Date | null;
  runAt: Date;
}>;

const insertJob = async (overrides: SeedJobOverrides = {}): Promise<void> => {
  const now = new Date();

  const {
    status = "pending",
    attemptNumber = 0,
    maxAttempts = 3,
    createdAt = now,
    claimedAt = null,
    completedAt = null,
    failedAt = null,
    visibilityTimeoutAt = null,
    runAt = now,
  } = overrides;

  await pool.query(
    `
      INSERT INTO jobs (
        id, queue_name, payload, status, run_at,
        attempt_number, max_attempts,
        claimed_at, completed_at, failed_at,
        visibility_timeout_at, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
    `,
    [
      randomUUID(),
      "test-queue",
      JSON.stringify({}),
      status,
      runAt,
      attemptNumber,
      maxAttempts,
      claimedAt,
      completedAt,
      failedAt,
      visibilityTimeoutAt,
      createdAt,
    ]
  );
};

describe("getMetrics", () => {
  beforeEach(resetJobs);

  afterAll(async () => {
    await resetJobs();
    await pool.end();
  });

  describe("empty table", () => {
    it("returns zeroed counts and null derived values with no jobs", async () => {
      const metrics = await getMetrics();

      expect(metrics.health.dlqCount).toBe(0);
      expect(metrics.health.retryableFailedCount).toBe(0);
      expect(metrics.health.oldestPendingAgeSeconds).toBeNull();
      expect(metrics.health.expiredProcessingCount).toBe(0);

      expect(metrics.latency.avgQueueWaitMs).toBeNull();
      expect(metrics.latency.avgProcessingTimeMs).toBeNull();
      expect(metrics.latency.avgEndToEndMs).toBeNull();

      expect(metrics.reliability.successRate).toBeNull();
      expect(metrics.reliability.failureRate).toBeNull();
      expect(metrics.reliability.retryRate).toBeNull();

      expect(metrics.throughput.createdPerMinute).toBe(0);
      expect(metrics.throughput.claimedPerMinute).toBe(0);
      expect(metrics.throughput.completedPerMinute).toBe(0);
      expect(metrics.throughput.failedPerMinute).toBe(0);
    });
  });

  describe("queue health", () => {
    it("counts jobs in the DLQ (failed with attempt_number >= max_attempts)", async () => {
      await insertJob({ status: "failed", attemptNumber: 3, maxAttempts: 3 });
      await insertJob({ status: "failed", attemptNumber: 1, maxAttempts: 3 });

      const metrics = await getMetrics();

      expect(metrics.health.dlqCount).toBe(1);
    });

    it("counts retryable failed jobs (failed with attempt_number < max_attempts)", async () => {
      await insertJob({ status: "failed", attemptNumber: 3, maxAttempts: 3 });
      await insertJob({ status: "failed", attemptNumber: 1, maxAttempts: 3 });

      const metrics = await getMetrics();

      expect(metrics.health.retryableFailedCount).toBe(1);
    });

    it("returns null oldest pending age when there are no pending jobs", async () => {
      await insertJob({ status: "processing" });

      const metrics = await getMetrics();

      expect(metrics.health.oldestPendingAgeSeconds).toBeNull();
    });

    it("calculates the oldest pending job's age", async () => {
      const createdAt = new Date(Date.now() - 60_000);
      await insertJob({ status: "pending", createdAt });
      await insertJob({
        status: "pending",
        createdAt: new Date(Date.now() - 5_000),
      });

      const metrics = await getMetrics();

      expect(metrics.health.oldestPendingAgeSeconds).not.toBeNull();
      expect(metrics.health.oldestPendingAgeSeconds!).toBeGreaterThanOrEqual(
        58
      );
      expect(metrics.health.oldestPendingAgeSeconds!).toBeLessThan(65);
    });

    it("counts expired processing jobs and treats NULL visibility_timeout_at as not expired", async () => {
      await insertJob({
        status: "processing",
        visibilityTimeoutAt: new Date(Date.now() - 5_000),
      });
      await insertJob({ status: "processing", visibilityTimeoutAt: null });
      await insertJob({
        status: "processing",
        visibilityTimeoutAt: new Date(Date.now() + 60_000),
      });

      const metrics = await getMetrics();

      expect(metrics.health.expiredProcessingCount).toBe(1);
    });
  });

  describe("latency", () => {
    it("only averages queue wait for jobs with both created_at and claimed_at", async () => {
      const createdAt = new Date(Date.now() - 10_000);
      const claimedAt = new Date(Date.now() - 5_000);

      await insertJob({ status: "processing", createdAt, claimedAt });
      await insertJob({ status: "pending", createdAt, claimedAt: null });

      const metrics = await getMetrics();

      expect(metrics.latency.avgQueueWaitMs).not.toBeNull();
      expect(metrics.latency.avgQueueWaitMs!).toBeGreaterThanOrEqual(4_000);
      expect(metrics.latency.avgQueueWaitMs!).toBeLessThan(6_000);
    });

    it("computes p50/p95/p99 queue wait via percentiles, ordered p50 <= p95 <= p99", async () => {
      const now = Date.now();

      for (const waitMs of [1_000, 2_000, 3_000, 4_000, 100_000]) {
        await insertJob({
          status: "processing",
          createdAt: new Date(now - waitMs),
          claimedAt: new Date(now),
        });
      }

      const metrics = await getMetrics();

      expect(metrics.latency.p50QueueWaitMs).not.toBeNull();
      expect(metrics.latency.p95QueueWaitMs).not.toBeNull();
      expect(metrics.latency.p99QueueWaitMs).not.toBeNull();
      expect(metrics.latency.p95QueueWaitMs!).toBeGreaterThanOrEqual(
        metrics.latency.p50QueueWaitMs!
      );
      expect(metrics.latency.p99QueueWaitMs!).toBeGreaterThanOrEqual(
        metrics.latency.p95QueueWaitMs!
      );
    });

    it("only averages processing time for jobs with claimed_at and completed_at", async () => {
      const claimedAt = new Date(Date.now() - 3_000);
      const completedAt = new Date();

      await insertJob({ status: "completed", claimedAt, completedAt });
      await insertJob({ status: "failed", attemptNumber: 3, maxAttempts: 3 });

      const metrics = await getMetrics();

      expect(metrics.latency.avgProcessingTimeMs).not.toBeNull();
      expect(metrics.latency.avgProcessingTimeMs!).toBeGreaterThanOrEqual(
        2_500
      );
    });

    it("computes p50/p95/p99 processing time via percentiles, ordered p50 <= p95 <= p99", async () => {
      const now = Date.now();

      for (const processingMs of [500, 1_500, 2_500, 3_500, 50_000]) {
        await insertJob({
          status: "completed",
          claimedAt: new Date(now - processingMs),
          completedAt: new Date(now),
        });
      }

      const metrics = await getMetrics();

      expect(metrics.latency.p50ProcessingTimeMs).not.toBeNull();
      expect(metrics.latency.p95ProcessingTimeMs).not.toBeNull();
      expect(metrics.latency.p99ProcessingTimeMs).not.toBeNull();
      expect(metrics.latency.p95ProcessingTimeMs!).toBeGreaterThanOrEqual(
        metrics.latency.p50ProcessingTimeMs!
      );
      expect(metrics.latency.p99ProcessingTimeMs!).toBeGreaterThanOrEqual(
        metrics.latency.p95ProcessingTimeMs!
      );
    });

    it("computes end-to-end latency (avg/p95/p99) from created_at to completed_at", async () => {
      const createdAt = new Date(Date.now() - 8_000);
      const completedAt = new Date();

      await insertJob({ status: "completed", createdAt, completedAt });

      const metrics = await getMetrics();

      expect(metrics.latency.avgEndToEndMs).not.toBeNull();
      expect(metrics.latency.p95EndToEndMs).not.toBeNull();
      expect(metrics.latency.p99EndToEndMs).not.toBeNull();
      expect(metrics.latency.avgEndToEndMs!).toBeGreaterThanOrEqual(7_000);
    });
  });

  describe("reliability", () => {
    it("calculates success and failure rate over terminal jobs only", async () => {
      await insertJob({ status: "completed" });
      await insertJob({ status: "completed" });
      await insertJob({ status: "failed", attemptNumber: 3, maxAttempts: 3 });
      await insertJob({ status: "pending" });
      await insertJob({ status: "processing" });

      const metrics = await getMetrics();

      expect(metrics.reliability.successRate).toBeCloseTo(2 / 3);
      expect(metrics.reliability.failureRate).toBeCloseTo(1 / 3);
    });

    it("calculates retry rate over terminal jobs, excluding in-flight retries", async () => {
      await insertJob({ status: "completed", attemptNumber: 1 });
      await insertJob({
        status: "failed",
        attemptNumber: 3,
        maxAttempts: 3,
      });
      // Attempted (attempt_number >= 1) but not yet terminal: these must not
      // be counted in either the numerator or the denominator.
      await insertJob({ status: "pending", attemptNumber: 1 });
      await insertJob({ status: "pending", attemptNumber: 1 });
      await insertJob({ status: "pending", attemptNumber: 1 });

      const metrics = await getMetrics();

      // Denominator is the 2 terminal jobs (not all 5 attempted jobs), and
      // only the failed one required more than one attempt.
      expect(metrics.reliability.retryRate).toBeCloseTo(0.5);
    });

    it("returns null retry rate when there are no terminal jobs, even if some jobs have been attempted", async () => {
      await insertJob({ status: "pending", attemptNumber: 1 });
      await insertJob({ status: "processing", attemptNumber: 2 });

      const metrics = await getMetrics();

      expect(metrics.reliability.retryRate).toBeNull();
    });
  });

  describe("latency unit consistency", () => {
    it("expresses queue wait, processing time, and end-to-end latency in milliseconds", async () => {
      const createdAt = new Date(Date.now() - 20_000);
      const claimedAt = new Date(Date.now() - 12_000);
      const completedAt = new Date();

      await insertJob({
        status: "completed",
        createdAt,
        claimedAt,
        completedAt,
      });

      const metrics = await getMetrics();

      const { avgQueueWaitMs, avgProcessingTimeMs, avgEndToEndMs } =
        metrics.latency;

      expect(avgQueueWaitMs).not.toBeNull();
      expect(avgProcessingTimeMs).not.toBeNull();
      expect(avgEndToEndMs).not.toBeNull();

      // Queue wait (created -> claimed) + processing time (claimed -> completed)
      // must reconstruct end-to-end latency (created -> completed) for a single
      // job. This only holds if all three are expressed in the same unit.
      expect(
        Math.abs(avgQueueWaitMs! + avgProcessingTimeMs! - avgEndToEndMs!)
      ).toBeLessThan(50);

      // Explicitly verify the unit is milliseconds, not seconds: a ~20s gap
      // must read as ~20000, not ~20.
      expect(avgEndToEndMs!).toBeGreaterThan(19_000);
      expect(avgEndToEndMs!).toBeLessThan(21_000);
    });
  });

  describe("throughput", () => {
    it("only counts jobs whose relevant timestamp falls within the last minute", async () => {
      const recent = new Date();
      const old = new Date(Date.now() - 5 * 60_000);

      await insertJob({
        status: "completed",
        createdAt: recent,
        claimedAt: recent,
        completedAt: recent,
      });
      await insertJob({
        status: "failed",
        attemptNumber: 3,
        maxAttempts: 3,
        createdAt: old,
        claimedAt: old,
        failedAt: old,
      });

      const metrics = await getMetrics();

      expect(metrics.throughput.createdPerMinute).toBe(1);
      expect(metrics.throughput.claimedPerMinute).toBe(1);
      expect(metrics.throughput.completedPerMinute).toBe(1);
      expect(metrics.throughput.failedPerMinute).toBe(0);
    });
  });

  describe("pool metrics", () => {
    it("reports connection counts from the shared pool", async () => {
      const metrics = await getMetrics();

      expect(metrics.pool.totalConnections).toBeGreaterThanOrEqual(1);
      expect(metrics.pool.idleConnections).toBeGreaterThanOrEqual(0);
      expect(metrics.pool.waitingClients).toBeGreaterThanOrEqual(0);
    });
  });
});
