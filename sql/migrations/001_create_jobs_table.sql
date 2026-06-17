CREATE TABLE jobs (
    id UUID PRIMARY KEY,

    queue_name TEXT NOT NULL,

    payload JSONB NOT NULL,

    status TEXT NOT NULL
        CHECK (
            status IN (
                'pending',
                'processing',
                'completed',
                'failed'
            )
        ),

    run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    worker_id TEXT,
    lease_id UUID,

    visibility_timeout_at TIMESTAMPTZ,

    attempt_number INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,

    idempotency_key TEXT,

    last_error TEXT,

    claimed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT jobs_attempt_number_non_negative
        CHECK (attempt_number >= 0),

    CONSTRAINT jobs_max_attempts_positive
        CHECK (max_attempts > 0)
);

CREATE UNIQUE INDEX jobs_idempotency_key_idx
    ON jobs (idempotency_key)
    WHERE idempotency_key IS NOT NULL;

/**  Optimizes the hot path for workers claiming the next available job.
     Allows PostgreSQL to quickly find pending jobs whose scheduled time has arrived.
*/

CREATE INDEX jobs_claim_idx
    ON jobs (
        status,
        run_at
    );

/** FOR THE REAPER - Find jobs whose visibility timeout expired */

CREATE INDEX jobs_visibility_timeout_idx
    ON jobs (
        visibility_timeout_at
    );
