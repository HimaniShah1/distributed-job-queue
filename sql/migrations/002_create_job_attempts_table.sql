CREATE TABLE job_attempts (
    id UUID PRIMARY KEY,

    job_id UUID NOT NULL,

    attempt_number INTEGER NOT NULL,

    worker_id TEXT,

    lease_id UUID,

    status TEXT NOT NULL
        CHECK (
            status IN (
                'processing',
                'completed',
                'failed'
            )
        ),

    error_message TEXT,

    started_at TIMESTAMPTZ NOT NULL,

    ended_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT job_attempts_job_fk
        FOREIGN KEY (job_id)
        REFERENCES jobs(id),

    CONSTRAINT job_attempts_attempt_number_positive
        CHECK (attempt_number > 0),

    CONSTRAINT job_attempts_job_attempt_unique
        UNIQUE (job_id, attempt_number)
);

