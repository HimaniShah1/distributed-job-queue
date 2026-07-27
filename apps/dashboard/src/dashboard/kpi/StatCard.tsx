import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type StatCardTone = 'warning' | 'success' | 'error' | 'info';

const TONE_CLASSES: Record<StatCardTone, string> = {
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
};

export interface StatCardTrend {
  direction: 'up' | 'down' | 'flat';
  label: string;
}

export interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  tone: StatCardTone;
  loading?: boolean;
  /** Not populated yet — no historical metrics source exists. Renders only when provided. */
  trend?: StatCardTrend;
  /** Not populated yet — no historical metrics source exists. Renders only when provided. */
  sparkline?: ReactNode;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  loading = false,
  trend,
  sparkline,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        {loading ? (
          <Skeleton className="size-9 rounded-md" />
        ) : (
          <span className={cn('flex size-9 items-center justify-center rounded-md', TONE_CLASSES[tone])}>
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </span>
        )}
        {loading ? (
          <Skeleton className="h-4 w-20" />
        ) : (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <span className="text-2xl font-semibold tracking-tight text-foreground">{value ?? '—'}</span>
        )}
        {!loading && sparkline}
      </div>
      <div className="min-h-4">
        {!loading && trend ? (
          <span
            className={cn(
              'text-xs',
              trend.direction === 'up' && 'text-success',
              trend.direction === 'down' && 'text-error',
              trend.direction === 'flat' && 'text-muted-foreground',
            )}
          >
            {trend.label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
