import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";

import { pool } from "../../db/pool";
import { buildApp } from "../app";

/**
 * Integration tests against a real Postgres database (DATABASE_URL) and a
 * real (unbound, via Fastify's inject()) instance of the GraphQL API.
 */

const resetJobs = async (): Promise<void> => {
  await pool.query("DELETE FROM job_attempts");
  await pool.query("DELETE FROM jobs");
};

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
});

afterEach(resetJobs);

afterAll(async () => {
  await resetJobs();
  await app.close();
  await pool.end();
});

const graphqlRequest = async (query: string, variables?: Record<string, unknown>) => {
  const response = await app.inject({
    method: "POST",
    url: "/graphql",
    payload: { query, variables },
  });

  return JSON.parse(response.body) as {
    data: Record<string, unknown> | null;
    errors?: Array<{ message: string }>;
  };
};

const CREATE_JOB_MUTATION = `
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      queueName
      status
      attemptNumber
      maxAttempts
      lastError
      createdAt
      updatedAt
    }
  }
`;

const RECENT_JOBS_QUERY = `
  query RecentJobs($limit: Int) {
    recentJobs(limit: $limit) {
      id
      queueName
      status
      attemptNumber
      maxAttempts
      createdAt
    }
  }
`;

describe("createJob mutation", () => {
  it("creates a real, pending job row via the existing QueueEngine/createJob path", async () => {
    const result = await graphqlRequest(CREATE_JOB_MUTATION, {
      input: {
        queueName: "demo",
        payload: JSON.stringify({ processingTimeMs: 100, shouldFail: false }),
      },
    });

    expect(result.errors).toBeUndefined();

    const created = result.data?.createJob as Record<string, unknown>;

    expect(created.queueName).toBe("demo");
    expect(created.status).toBe("pending");
    expect(created.attemptNumber).toBe(0);
    expect(created.maxAttempts).toBe(3);

    const row = await pool.query("SELECT * FROM jobs WHERE id = $1", [created.id]);

    expect(row.rowCount).toBe(1);
    expect(row.rows[0].status).toBe("pending");
    expect(row.rows[0].payload).toEqual({ processingTimeMs: 100, shouldFail: false });
  });

  it("respects a custom maxAttempts", async () => {
    const result = await graphqlRequest(CREATE_JOB_MUTATION, {
      input: { queueName: "demo", payload: "{}", maxAttempts: 7 },
    });

    expect((result.data?.createJob as Record<string, unknown>).maxAttempts).toBe(7);
  });

  it("defaults maxAttempts to 3 when omitted, matching the backend default", async () => {
    const result = await graphqlRequest(CREATE_JOB_MUTATION, {
      input: { queueName: "demo", payload: "{}" },
    });

    expect((result.data?.createJob as Record<string, unknown>).maxAttempts).toBe(3);
  });

  it("rejects an invalid JSON payload and creates no row", async () => {
    const result = await graphqlRequest(CREATE_JOB_MUTATION, {
      input: { queueName: "demo", payload: "not valid json" },
    });

    expect(result.errors?.[0]?.message).toMatch(/invalid json payload/i);

    const count = await pool.query("SELECT COUNT(*) FROM jobs");
    expect(Number(count.rows[0].count)).toBe(0);
  });

  it("rejects a non-object JSON payload (array/primitive)", async () => {
    const result = await graphqlRequest(CREATE_JOB_MUTATION, {
      input: { queueName: "demo", payload: "[1, 2, 3]" },
    });

    expect(result.errors?.[0]?.message).toMatch(/payload must be a json object/i);
  });

  it("supports creating a small batch of jobs (as the demo workload does), each a real row", async () => {
    const batchSize = 5;

    const results = await Promise.all(
      Array.from({ length: batchSize }, (_, i) =>
        graphqlRequest(CREATE_JOB_MUTATION, {
          input: {
            queueName: "demo",
            payload: JSON.stringify({ processingTimeMs: 50, shouldFail: i === 0 }),
          },
        })
      )
    );

    expect(results.every((r) => r.errors === undefined)).toBe(true);

    const count = await pool.query("SELECT COUNT(*) FROM jobs WHERE queue_name = 'demo'");
    expect(Number(count.rows[0].count)).toBe(batchSize);
  });
});

describe("recentJobs query", () => {
  it("returns real jobs from Postgres, most recent first", async () => {
    await graphqlRequest(CREATE_JOB_MUTATION, {
      input: { queueName: "alpha", payload: "{}" },
    });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await graphqlRequest(CREATE_JOB_MUTATION, {
      input: { queueName: "beta", payload: "{}" },
    });

    const result = await graphqlRequest(RECENT_JOBS_QUERY, { limit: 10 });

    expect(result.errors).toBeUndefined();

    const jobs = result.data?.recentJobs as Array<Record<string, unknown>>;

    expect(jobs).toHaveLength(2);
    expect(jobs[0].queueName).toBe("beta");
    expect(jobs[1].queueName).toBe("alpha");
  });

  it("respects the limit argument", async () => {
    for (let i = 0; i < 4; i++) {
      await graphqlRequest(CREATE_JOB_MUTATION, {
        input: { queueName: "demo", payload: "{}" },
      });
    }

    const result = await graphqlRequest(RECENT_JOBS_QUERY, { limit: 2 });

    expect(result.data?.recentJobs).toHaveLength(2);
  });

  it("returns an empty list when there are no jobs", async () => {
    const result = await graphqlRequest(RECENT_JOBS_QUERY, { limit: 10 });

    expect(result.data?.recentJobs).toEqual([]);
  });
});
