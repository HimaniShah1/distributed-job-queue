# Distributed Job Queue

A production-inspired distributed job queue built from scratch using Node.js, TypeScript, and PostgreSQL.

The goal of this project is not to build yet another queue library. The goal is to understand the engineering decisions behind systems such as BullMQ, Sidekiq, and Amazon SQS by implementing the core primitives myself and documenting the tradeoffs along the way.

This repository serves as both an implementation and a learning log. Every major design decision, tradeoff, and architectural change will be documented as the project evolves.

---

## Why This Project Exists

Most application developers use queue systems as black boxes:

```text
enqueue(job)
```

and later:

```text
process(job)
```

The interesting parts happen in between:

* How does a worker claim a job without another worker claiming the same job?
* What happens if a worker crashes halfway through processing?
* How are retries coordinated safely?
* How does the system prevent duplicate execution?
* How does a queue recover from partial failures?
* What operational data is needed to debug production incidents?

This project exists to answer those questions by building the queue from first principles.

---

## Why PostgreSQL?

Most queue tutorials immediately reach for Redis, RabbitMQ, or a dedicated queue service.

This project intentionally uses PostgreSQL to explore:

* Row-level locking
* Transactions
* `FOR UPDATE SKIP LOCKED`
* Lease-based ownership
* Failure recovery
* Schema design
* Operational tradeoffs of using a relational database as a queue

The objective is not to prove that PostgreSQL is the best queue backend.

The objective is to understand the mechanics that queue systems rely on internally.

---

## Planned Architecture

```text
Producer
    │
    ▼
 PostgreSQL
 Jobs Table
    │
    ▼
  Workers
    │
    ├── Success → Completed
    │
    └── Failure
            │
            ▼
         Retries
            │
            ▼
           DLQ
```

---

## Planned Features

### Core Queueing

* Atomic job claiming using `FOR UPDATE SKIP LOCKED`
* Multiple concurrent workers
* Delayed and scheduled jobs
* Lease-based ownership model
* Visibility timeouts
* Reaper process for crashed worker recovery

### Reliability

* Exponential backoff retries
* Dead Letter Queue (DLQ)
* Idempotency keys
* Worker crash recovery

### Performance

* PostgreSQL `LISTEN/NOTIFY`
* Connection pooling with `pg.Pool`
* Optimized queue indexes

### Observability

* Structured logging with Pino
* Metrics endpoint
* React dashboard
* Job execution history

---

## Job Lifecycle (Planned)

```text
pending
    │
    ▼
processing
    │
    ├── success
    │      │
    │      ▼
    │   completed
    │
    └── failure
           │
           ▼
        pending
           │
           ▼
      max attempts
           │
           ▼
         failed
           │
           ▼
           DLQ
```

---

## Design Decisions & Tradeoffs

This section will be updated throughout development.

### Migration Strategy

Decision:

* Use raw SQL migrations.
* Build a custom migration runner.

Reason:

* Learn how migration systems work internally.
* Keep schema evolution explicit and versioned.

Tradeoff:

* More code to maintain than using an existing migration tool.

---

### Migration Tracking

Decision:

* Store applied migrations in a `schema_migrations` table.

Reason:

* Prevent already-applied migrations from running again.

Tradeoff:

* Applied migrations are currently assumed to be immutable.

Future Improvement:

* Migration checksums similar to Flyway.

---

### Database Connectivity

Decision:

* Use `pg.Pool`.

Reason:

* Production systems reuse database connections rather than creating new connections for every query.

Tradeoff:

* Requires pool management and proper connection cleanup.

---

### Logging

Decision:

* Use Pino instead of `console.log`.

Reason:

* Structured logs are easier to query, filter, and analyze in production environments.

---

## Development Progress

### Phase 0 — Research

Completed:

* Read Brandur Leach's PostgreSQL job queue article.
* Studied PostgreSQL locking behavior.
* Studied `FOR UPDATE SKIP LOCKED`.
* Explored queue architecture and failure modes.

Key Concepts Learned:

* Atomic job claiming
* Visibility timeouts
* Lease-based ownership
* Worker crash recovery
* Dead Letter Queues
* Retry semantics

---

### Phase 1 — Foundation

Completed:

* Project setup
* Dockerized PostgreSQL
* TypeScript configuration
* Environment configuration
* Pino logging
* PostgreSQL connection pooling
* GitHub repository setup

In Progress:

* Custom migration runner
* Jobs table schema

---

### Future Phases

Phase 2

* Jobs schema
* Job creation API

Phase 3

* Atomic job claiming using `FOR UPDATE SKIP LOCKED`

Phase 4

* Worker execution engine

Phase 5

* Visibility timeouts and reaper

Phase 6

* Retries and DLQ

Phase 7

* LISTEN/NOTIFY

Phase 8

* Metrics and dashboard

---

## Running the Project

```bash
docker compose up -d

npm install

npm run migrate

npm run dev
```

---

## Project Status

🚧 Active Development

Current Focus:

* Migration system
* Jobs table schema
* Atomic job claiming design
