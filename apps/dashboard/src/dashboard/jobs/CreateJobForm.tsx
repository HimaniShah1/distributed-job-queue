import { useId, useState, type FormEvent } from 'react';
import { Loader2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateJob } from '../hooks/useCreateJob';
import { JobStatusBadge } from './JobStatusBadge';

const DEFAULT_QUEUE_NAME = 'default';
const DEFAULT_PAYLOAD = '{\n  "processingTimeMs": 1000,\n  "shouldFail": false\n}';
const DEFAULT_MAX_ATTEMPTS = 3;

interface CreatedJobSummary {
  id: string;
  status: string;
}

function validatePayload(value: string): string | undefined {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    return 'Invalid JSON';
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return 'Payload must be a JSON object';
  }

  return undefined;
}

export function CreateJobForm() {
  const queueNameId = useId();
  const payloadId = useId();
  const maxAttemptsId = useId();

  const [queueName, setQueueName] = useState(DEFAULT_QUEUE_NAME);
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [maxAttempts, setMaxAttempts] = useState(DEFAULT_MAX_ATTEMPTS);
  const [payloadError, setPayloadError] = useState<string | undefined>(undefined);
  const [created, setCreated] = useState<CreatedJobSummary | undefined>(undefined);

  const { createJob, loading, error } = useCreateJob();

  const handlePayloadChange = (value: string) => {
    setPayload(value);
    if (payloadError) {
      setPayloadError(validatePayload(value));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setCreated(undefined);

    const validationError = validatePayload(payload);
    if (validationError) {
      setPayloadError(validationError);
      return;
    }

    const job = await createJob({
      queueName: queueName.trim() || DEFAULT_QUEUE_NAME,
      payload,
      maxAttempts,
    });

    if (job) {
      setCreated({ id: job.id, status: job.status });
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <span className="text-sm font-medium text-foreground">Create Job</span>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={queueNameId} className="text-xs text-muted-foreground">
            Queue name
          </label>
          <Input
            id={queueNameId}
            value={queueName}
            onChange={(e) => setQueueName(e.target.value)}
            placeholder="e.g. emails"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={payloadId} className="text-xs text-muted-foreground">
            Payload (JSON)
          </label>
          <Textarea
            id={payloadId}
            value={payload}
            onChange={(e) => handlePayloadChange(e.target.value)}
            onBlur={(e) => setPayloadError(validatePayload(e.target.value))}
            aria-invalid={Boolean(payloadError)}
            rows={4}
            className="font-mono text-xs"
          />
          {payloadError ? (
            <span role="alert" className="text-xs text-error">
              {payloadError}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={maxAttemptsId} className="text-xs text-muted-foreground">
            Max attempts
          </label>
          <Input
            id={maxAttemptsId}
            type="number"
            min={1}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Math.max(1, Number(e.target.value) || 1))}
            className="max-w-24"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={loading || Boolean(payloadError)} className="gap-1.5">
            {loading ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
            ) : (
              <Plus className="size-4" strokeWidth={1.75} />
            )}
            Create Job
          </Button>

          {created ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Created
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">{created.id.slice(0, 8)}</code>
              <JobStatusBadge status={created.status} />
            </span>
          ) : null}
        </div>

        {error ? (
          <span role="alert" className="text-xs text-error">
            Failed to create job: {error.message}
          </span>
        ) : null}
      </form>
    </div>
  );
}
