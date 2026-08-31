/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CreateJobInput = {
  maxAttempts?: number | null | undefined;
  /** A JSON-encoded object */
  payload: string;
  queueName: string;
};

export type CreateJobMutationVariables = Exact<{
  input: CreateJobInput;
}>;


export type CreateJobMutation = { createJob: { id: string, queueName: string, status: string, attemptNumber: number, maxAttempts: number, createdAt: string } };

export type DashboardStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardStatsQuery = { dashboardStats: { jobs: { pending: number, processing: number, completed: number, failed: number }, workers: { active: number } } };

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { health: { status: string, uptime: number } };

export type QueueMetricsQueryVariables = Exact<{ [key: string]: never; }>;


export type QueueMetricsQuery = { queueMetrics: { health: { dlqCount: number, retryableFailedCount: number, oldestPendingAgeSeconds: number | null, expiredProcessingCount: number }, latency: { p50QueueWaitMs: number | null, p95QueueWaitMs: number | null, p99QueueWaitMs: number | null, p50ProcessingTimeMs: number | null, p95ProcessingTimeMs: number | null, p99ProcessingTimeMs: number | null, p95EndToEndMs: number | null, p99EndToEndMs: number | null }, reliability: { successRate: number | null, failureRate: number | null, retryRate: number | null }, throughput: { createdPerMinute: number, claimedPerMinute: number, completedPerMinute: number, failedPerMinute: number }, pool: { totalConnections: number, idleConnections: number, waitingClients: number } } };

export type RecentJobsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type RecentJobsQuery = { recentJobs: Array<{ id: string, queueName: string, status: string, attemptNumber: number, maxAttempts: number, lastError: string | null, createdAt: string, updatedAt: string }> };


export const CreateJobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateJob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateJobInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createJob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"queueName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"maxAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateJobMutation, CreateJobMutationVariables>;
export const DashboardStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboardStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"jobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pending"}},{"kind":"Field","name":{"kind":"Name","value":"processing"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"failed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"active"}}]}}]}}]}}]} as unknown as DocumentNode<DashboardStatsQuery, DashboardStatsQueryVariables>;
export const HealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uptime"}}]}}]}}]} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>;
export const QueueMetricsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"QueueMetrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"queueMetrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dlqCount"}},{"kind":"Field","name":{"kind":"Name","value":"retryableFailedCount"}},{"kind":"Field","name":{"kind":"Name","value":"oldestPendingAgeSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"expiredProcessingCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"latency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"p50QueueWaitMs"}},{"kind":"Field","name":{"kind":"Name","value":"p95QueueWaitMs"}},{"kind":"Field","name":{"kind":"Name","value":"p99QueueWaitMs"}},{"kind":"Field","name":{"kind":"Name","value":"p50ProcessingTimeMs"}},{"kind":"Field","name":{"kind":"Name","value":"p95ProcessingTimeMs"}},{"kind":"Field","name":{"kind":"Name","value":"p99ProcessingTimeMs"}},{"kind":"Field","name":{"kind":"Name","value":"p95EndToEndMs"}},{"kind":"Field","name":{"kind":"Name","value":"p99EndToEndMs"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reliability"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"successRate"}},{"kind":"Field","name":{"kind":"Name","value":"failureRate"}},{"kind":"Field","name":{"kind":"Name","value":"retryRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"throughput"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdPerMinute"}},{"kind":"Field","name":{"kind":"Name","value":"claimedPerMinute"}},{"kind":"Field","name":{"kind":"Name","value":"completedPerMinute"}},{"kind":"Field","name":{"kind":"Name","value":"failedPerMinute"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pool"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalConnections"}},{"kind":"Field","name":{"kind":"Name","value":"idleConnections"}},{"kind":"Field","name":{"kind":"Name","value":"waitingClients"}}]}}]}}]}}]} as unknown as DocumentNode<QueueMetricsQuery, QueueMetricsQueryVariables>;
export const RecentJobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecentJobs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recentJobs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"queueName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"attemptNumber"}},{"kind":"Field","name":{"kind":"Name","value":"maxAttempts"}},{"kind":"Field","name":{"kind":"Name","value":"lastError"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<RecentJobsQuery, RecentJobsQueryVariables>;