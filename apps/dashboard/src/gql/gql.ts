/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateJob($input: CreateJobInput!) {\n    createJob(input: $input) {\n      id\n      queueName\n      status\n      attemptNumber\n      maxAttempts\n      createdAt\n    }\n  }\n": typeof types.CreateJobDocument,
    "\n  query DashboardStats {\n    dashboardStats {\n      jobs {\n        pending\n        processing\n        completed\n        failed\n      }\n      workers {\n        active\n      }\n    }\n  }\n": typeof types.DashboardStatsDocument,
    "\n  query Health {\n    health {\n      status\n      uptime\n    }\n  }\n": typeof types.HealthDocument,
    "\n  query QueueMetrics {\n    queueMetrics {\n      health {\n        dlqCount\n        retryableFailedCount\n        oldestPendingAgeSeconds\n        expiredProcessingCount\n      }\n      latency {\n        p50QueueWaitMs\n        p95QueueWaitMs\n        p99QueueWaitMs\n        p50ProcessingTimeMs\n        p95ProcessingTimeMs\n        p99ProcessingTimeMs\n        p95EndToEndMs\n        p99EndToEndMs\n      }\n      reliability {\n        successRate\n        failureRate\n        retryRate\n      }\n      throughput {\n        createdPerMinute\n        claimedPerMinute\n        completedPerMinute\n        failedPerMinute\n      }\n      pool {\n        totalConnections\n        idleConnections\n        waitingClients\n      }\n    }\n  }\n": typeof types.QueueMetricsDocument,
    "\n  query RecentJobs($limit: Int) {\n    recentJobs(limit: $limit) {\n      id\n      queueName\n      status\n      attemptNumber\n      maxAttempts\n      lastError\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.RecentJobsDocument,
};
const documents: Documents = {
    "\n  mutation CreateJob($input: CreateJobInput!) {\n    createJob(input: $input) {\n      id\n      queueName\n      status\n      attemptNumber\n      maxAttempts\n      createdAt\n    }\n  }\n": types.CreateJobDocument,
    "\n  query DashboardStats {\n    dashboardStats {\n      jobs {\n        pending\n        processing\n        completed\n        failed\n      }\n      workers {\n        active\n      }\n    }\n  }\n": types.DashboardStatsDocument,
    "\n  query Health {\n    health {\n      status\n      uptime\n    }\n  }\n": types.HealthDocument,
    "\n  query QueueMetrics {\n    queueMetrics {\n      health {\n        dlqCount\n        retryableFailedCount\n        oldestPendingAgeSeconds\n        expiredProcessingCount\n      }\n      latency {\n        p50QueueWaitMs\n        p95QueueWaitMs\n        p99QueueWaitMs\n        p50ProcessingTimeMs\n        p95ProcessingTimeMs\n        p99ProcessingTimeMs\n        p95EndToEndMs\n        p99EndToEndMs\n      }\n      reliability {\n        successRate\n        failureRate\n        retryRate\n      }\n      throughput {\n        createdPerMinute\n        claimedPerMinute\n        completedPerMinute\n        failedPerMinute\n      }\n      pool {\n        totalConnections\n        idleConnections\n        waitingClients\n      }\n    }\n  }\n": types.QueueMetricsDocument,
    "\n  query RecentJobs($limit: Int) {\n    recentJobs(limit: $limit) {\n      id\n      queueName\n      status\n      attemptNumber\n      maxAttempts\n      lastError\n      createdAt\n      updatedAt\n    }\n  }\n": types.RecentJobsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateJob($input: CreateJobInput!) {\n    createJob(input: $input) {\n      id\n      queueName\n      status\n      attemptNumber\n      maxAttempts\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateJob($input: CreateJobInput!) {\n    createJob(input: $input) {\n      id\n      queueName\n      status\n      attemptNumber\n      maxAttempts\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DashboardStats {\n    dashboardStats {\n      jobs {\n        pending\n        processing\n        completed\n        failed\n      }\n      workers {\n        active\n      }\n    }\n  }\n"): (typeof documents)["\n  query DashboardStats {\n    dashboardStats {\n      jobs {\n        pending\n        processing\n        completed\n        failed\n      }\n      workers {\n        active\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Health {\n    health {\n      status\n      uptime\n    }\n  }\n"): (typeof documents)["\n  query Health {\n    health {\n      status\n      uptime\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query QueueMetrics {\n    queueMetrics {\n      health {\n        dlqCount\n        retryableFailedCount\n        oldestPendingAgeSeconds\n        expiredProcessingCount\n      }\n      latency {\n        p50QueueWaitMs\n        p95QueueWaitMs\n        p99QueueWaitMs\n        p50ProcessingTimeMs\n        p95ProcessingTimeMs\n        p99ProcessingTimeMs\n        p95EndToEndMs\n        p99EndToEndMs\n      }\n      reliability {\n        successRate\n        failureRate\n        retryRate\n      }\n      throughput {\n        createdPerMinute\n        claimedPerMinute\n        completedPerMinute\n        failedPerMinute\n      }\n      pool {\n        totalConnections\n        idleConnections\n        waitingClients\n      }\n    }\n  }\n"): (typeof documents)["\n  query QueueMetrics {\n    queueMetrics {\n      health {\n        dlqCount\n        retryableFailedCount\n        oldestPendingAgeSeconds\n        expiredProcessingCount\n      }\n      latency {\n        p50QueueWaitMs\n        p95QueueWaitMs\n        p99QueueWaitMs\n        p50ProcessingTimeMs\n        p95ProcessingTimeMs\n        p99ProcessingTimeMs\n        p95EndToEndMs\n        p99EndToEndMs\n      }\n      reliability {\n        successRate\n        failureRate\n        retryRate\n      }\n      throughput {\n        createdPerMinute\n        claimedPerMinute\n        completedPerMinute\n        failedPerMinute\n      }\n      pool {\n        totalConnections\n        idleConnections\n        waitingClients\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RecentJobs($limit: Int) {\n    recentJobs(limit: $limit) {\n      id\n      queueName\n      status\n      attemptNumber\n      maxAttempts\n      lastError\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query RecentJobs($limit: Int) {\n    recentJobs(limit: $limit) {\n      id\n      queueName\n      status\n      attemptNumber\n      maxAttempts\n      lastError\n      createdAt\n      updatedAt\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;