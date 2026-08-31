import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useDemoWorkload } from '../hooks/useDemoWorkload';

export function DemoWorkloadButton() {
  const { runDemoWorkload, isRunning, result, error } = useDemoWorkload();

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <span className="text-sm font-medium text-foreground">Demo Workload</span>
      <p className="text-xs text-muted-foreground">
        Creates a small batch of real jobs through the Queue Engine, including some that fail and retry.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => void runDemoWorkload()}
          disabled={isRunning}
          className="gap-1.5"
        >
          {isRunning ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
          ) : (
            <Sparkles className="size-4" strokeWidth={1.75} />
          )}
          {isRunning ? 'Running…' : 'Run Demo Workload'}
        </Button>

        {result ? (
          <span role="status" className="text-xs text-muted-foreground">
            Created {result.createdCount}/{result.total} jobs
          </span>
        ) : null}
      </div>

      {error ? (
        <span role="alert" className="text-xs text-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
