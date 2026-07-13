# Distributed Job Queue

A production-inspired distributed job queue built from scratch using **Node.js**, **TypeScript**, and **PostgreSQL**.

The goal of this project isn't to build another queue library.

The goal is to understand how production-grade systems like BullMQ, Sidekiq, Faktory, and Amazon SQS actually work by implementing their core primitives from first principles and documenting the engineering tradeoffs behind every decision.

This repository serves as both a working implementation and an engineering journal.

---

# Why This Project Exists

Most developers interact with queues through an API that looks something like this:

```ts
await queue.add(job);
```

and later:

```ts
await worker.process(job);
```

The interesting engineering problems happen in between.

Questions I wanted to answer:

* How does a worker claim a job without another worker claiming it?
* What happens when a worker crashes after claiming a job?
* How do retries happen safely?
* How are duplicate acknowledgements prevented?
* Why do queue systems use leases instead of worker IDs?
* How are long-running jobs protected?
* How do production systems recover from partial failures?
* How do multiple workers coordinate without processing the same job twice?

Instead of treating distributed queues as black boxes, this project builds those primitives one at a time.

---

# Why PostgreSQL?

Most tutorials immediately reach for Redis, RabbitMQ, Kafka, or a managed queue service.

This project intentionally uses PostgreSQL to understand:

* Row-level locking
* Transactions
* `FOR UPDATE SKIP LOCKED`
* Visibility timeouts
* Lease-based ownership
* Worker crash recovery
* Retry coordination
* Queue schema design
* Operational tradeoffs

The objective isn't to prove PostgreSQL is the best queue backend.

The objective is to understand the mechanisms that production queue systems rely on internally.

---

# Features

* Atomic job claiming using `FOR UPDATE SKIP LOCKED`
* Multiple concurrent workers
* Lease-based ownership
* Heartbeats
* Visibility timeouts
* Worker crash recovery
* Automatic retries
* Reaper for expired leases
* PostgreSQL `LISTEN / NOTIFY`
* Idempotent job creation
* Job execution history
* Local benchmarking framework

---

# Architecture

```text
                    Producer
                        │
                        ▼
                  createJob()
                        │
             INSERT + NOTIFY
                        │
                        ▼
                  PostgreSQL
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
     Worker 1        Worker 2       Worker N
        │               │               │
        └────── claimJob() ─────────────┘
                        │
                 SKIP LOCKED
                        │
                  Heartbeats
                        │
            Complete / Retry / Fail
                        │
                        ▼
                 job_attempts
                        │
                        ▼
                     Reaper
           Reclaims expired leases
```

---

# Reliability Guarantees

The queue currently provides:

* At-least-once delivery
* Atomic job claiming
* Lease-based ownership
* Safe acknowledgements using lease validation
* Automatic recovery from worker crashes
* Concurrent processing using `FOR UPDATE SKIP LOCKED`
* Push-based worker wake-up using PostgreSQL `LISTEN / NOTIFY`

---

# Current Database Schema

## jobs

Stores the latest state of every job.

```text
id

queue_name
payload

status

run_at

worker_id
lease_id
visibility_timeout_at

attempt_number
max_attempts

idempotency_key

last_error

claimed_at
completed_at
failed_at

created_at
updated_at
```

---

## job_attempts

Stores the complete execution history for every processing attempt.

```text
id

job_id
attempt_number

worker_id
lease_id

status

error_message

started_at
ended_at

created_at
```

---

# Core Concepts

## Atomic Job Claiming

Workers atomically claim jobs using PostgreSQL row-level locking.

```sql
FOR UPDATE SKIP LOCKED
```

This guarantees that multiple workers can safely process the queue concurrently without claiming the same job.

---

## Lease-Based Ownership

Every successful claim generates a unique lease.

Workers never acknowledge jobs using only a worker ID.

Instead, every completion, failure, or heartbeat validates the lease before updating the database.

This prevents stale workers from modifying jobs they no longer own.

---

## Visibility Timeouts

Every claimed job receives a visibility timeout.

While processing, workers periodically extend this timeout using heartbeats.

If a worker crashes before completing the job, the timeout eventually expires, allowing another worker to safely reclaim the work.

---

## Heartbeats

Workers periodically renew their lease while processing long-running jobs.

This prevents legitimate work from being reclaimed prematurely while still allowing crashed workers to be detected automatically.

---

## Automatic Retries

Failed jobs are returned to the queue until their configured retry limit is reached.

Retry state is coordinated through the database to ensure ownership remains consistent across worker failures.

---

## Reaper

A background reaper periodically scans for expired leases.

Jobs whose visibility timeout has expired are moved back to the pending state, making them available for another worker to process.

This enables automatic recovery from worker crashes.

---

## PostgreSQL LISTEN / NOTIFY

Workers use PostgreSQL's publish/subscribe mechanism to avoid constant polling.

When a producer creates a new job, PostgreSQL immediately wakes sleeping workers using `NOTIFY`.

Workers still perform periodic polling as a safety mechanism in case notifications are missed due to temporary network interruptions or listener reconnects.

---

## Job Attempt History

The queue separates the latest job state from execution history.

* `jobs` stores the current state.
* `job_attempts` stores every processing attempt.

This provides a complete audit trail for retries, failures, and worker crashes.

---

# Design Decisions

## PostgreSQL Instead of Redis

**Decision**

Use PostgreSQL as the queue backend.

**Reason**

Understand how transactional databases can coordinate distributed workers using locking and transactions.

**Tradeoff**

Lower throughput than an in-memory queue but significantly stronger transactional guarantees.

---

## Lease-Based Ownership

**Decision**

Use both `worker_id` and `lease_id`.

**Reason**

A worker can restart, reclaim a job, or process multiple attempts.

The lease represents ownership of a specific execution rather than ownership by a worker process.

---

## Separate Attempt History

**Decision**

Store execution history in a separate table.

**Reason**

Current job state should remain small while historical execution data remains queryable.

---

## Optional Idempotency Keys

**Decision**

Allow producers to provide idempotency keys.

**Reason**

Only the producer knows whether two enqueue requests represent the same business operation.

---

## Raw SQL Migrations

**Decision**

Build a custom migration system.

**Reason**

Understand how migration frameworks work internally while keeping schema evolution explicit.

---

## Structured Logging

**Decision**

Use Pino.

**Reason**

Structured logs are significantly easier to search and analyze than plain console output.

---

# Performance

Local benchmark environment:

* Apple MacBook Air M2
* PostgreSQL 17 (Docker)
* Node.js
* TypeScript

Benchmark measures queue overhead using an empty job processor to isolate claiming, leasing, acknowledgements, and scheduling.

| Workers |   Jobs |      Throughput |
| ------: | -----: | --------------: |
|       1 | 10,000 |   ~344 jobs/sec |
|       2 | 10,000 |   ~664 jobs/sec |
|       4 | 10,000 |   ~905 jobs/sec |
|       8 | 10,000 | ~1,239 jobs/sec |

Throughput increases with additional workers until PostgreSQL becomes the primary coordination bottleneck due to shared transactional resources.

---

# Development Progress

## Phase 0 — Research

* PostgreSQL queue architectures
* Row-level locking
* `FOR UPDATE SKIP LOCKED`
* Visibility timeouts
* Lease-based ownership
* Retry semantics
* Worker crash recovery

---

## Phase 1 — Foundation

* Dockerized PostgreSQL
* TypeScript project setup
* Environment configuration
* Pino logging
* PostgreSQL connection pooling
* Custom migration runner
* Migration tracking system

---

## Phase 2 — Core Queue

* Jobs schema
* Job attempts schema
* Job creation
* Idempotency support
* Atomic claiming
* Lease generation
* Transactional claim flow

---

## Phase 3 — Worker Lifecycle

* Job completion
* Failure handling
* Lease validation
* Automatic retries
* Heartbeats

---

## Phase 4 — Recovery

* Visibility timeout recovery
* Reaper process
* Worker crash recovery

---

## Phase 5 — Worker Coordination

* PostgreSQL `LISTEN / NOTIFY`
* Multiple concurrent workers
* Crash recovery testing
* Concurrent worker testing

---

## Phase 6 — Benchmarking

* Local benchmarking framework
* Multi-worker scalability testing
* Throughput benchmarking

---

## Next Milestones

* Metrics endpoint
* Real-time dashboard
* PostgreSQL query profiling
* Performance optimization
* Bulk enqueue optimization
* Distributed consensus (Raft)
* gRPC-based node communication
* PostgreSQL replacement with a custom distributed coordination layer

---

# Running the Project

```bash
docker compose up -d

npm install

npm run migrate

npm run dev
```

---

# Project Status

🚧 Active Development

Current focus:

* Observability dashboard
* Metrics endpoint
* PostgreSQL profiling
* Performance tuning
* Distributed systems primitives beyond PostgreSQL
