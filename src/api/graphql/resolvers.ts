import { dashboardService } from "../services/dashboard.service";

import type { Job } from "../../types/jobs";

const startedAt = Date.now();

const toGraphQLJob = (job: Job) => ({
  id: job.id,
  queueName: job.queue_name,
  status: job.status,
  attemptNumber: job.attempt_number,
  maxAttempts: job.max_attempts,
  lastError: job.last_error,
  createdAt: job.created_at.toISOString(),
  updatedAt: job.updated_at.toISOString(),
});

const parseJobPayload = (raw: string): Record<string, unknown> => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON payload");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Payload must be a JSON object");
  }

  return parsed as Record<string, unknown>;
};

type CreateJobArgs = {
  input: {
    queueName: string;
    payload: string;
    maxAttempts?: number;
  };
};

type RecentJobsArgs = {
  limit?: number;
};

export const resolvers = {
  Query: {
    health: () => ({
      status: "healthy",
      uptime: (Date.now() - startedAt) / 1000,
    }),

    dashboardStats: async () => {
      return dashboardService.getDashboardStats();
    },

    queueMetrics: async () => {
      return dashboardService.getQueueMetrics();
    },

    recentJobs: async (_parent: unknown, args: RecentJobsArgs) => {
      const jobs = await dashboardService.getRecentJobs(args.limit);

      return jobs.map(toGraphQLJob);
    },
  },

  Mutation: {
    createJob: async (_parent: unknown, args: CreateJobArgs) => {
      const payload = parseJobPayload(args.input.payload);

      const job = await dashboardService.createJob({
        queueName: args.input.queueName,
        payload,
        maxAttempts: args.input.maxAttempts,
      });

      return toGraphQLJob(job);
    },
  },
};