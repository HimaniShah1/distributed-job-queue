import type { ErrorLike } from '@apollo/client';

import type { RecentJobsQuery } from '../../gql/graphql';
import { Skeleton } from '@/components/ui/skeleton';
import { JobStatusBadge } from './JobStatusBadge';

type RecentJob = RecentJobsQuery['recentJobs'][number];

interface RecentJobsListProps {
  jobs: RecentJob[] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
}

const formatTime = (iso: string): string => new Date(iso).toLocaleTimeString();

export function RecentJobsList({ jobs, loading, error }: RecentJobsListProps) {
  if (error && !jobs) {
    return (
      <div role="alert" className="rounded-lg border border-error/40 bg-error/10 p-4 text-sm text-error">
        Failed to load recent jobs: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <span className="text-sm font-medium text-foreground">Recent Jobs</span>

      {error && jobs ? (
        <div
          role="status"
          className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning"
        >
          Couldn't refresh recent jobs — showing the last known values.
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-2" aria-busy>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No jobs yet — create one to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-1.5 pr-3 font-medium">Job ID</th>
                <th className="py-1.5 pr-3 font-medium">Queue</th>
                <th className="py-1.5 pr-3 font-medium">Status</th>
                <th className="py-1.5 pr-3 font-medium">Attempts</th>
                <th className="py-1.5 pr-3 font-medium">Created</th>
                <th className="py-1.5 pr-3 font-medium">Updated</th>
                <th className="py-1.5 font-medium">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="py-1.5 pr-3 font-mono text-xs text-foreground">{job.id.slice(0, 8)}</td>
                  <td className="py-1.5 pr-3 text-muted-foreground">{job.queueName}</td>
                  <td className="py-1.5 pr-3">
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">
                    {job.attemptNumber}/{job.maxAttempts}
                  </td>
                  <td className="py-1.5 pr-3 text-muted-foreground">{formatTime(job.createdAt)}</td>
                  <td className="py-1.5 pr-3 text-muted-foreground">{formatTime(job.updatedAt)}</td>
                  <td
                    className="max-w-40 truncate py-1.5 text-error"
                    title={job.lastError ?? undefined}
                  >
                    {job.lastError ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
