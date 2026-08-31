import { cn } from '@/lib/utils';

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  processing: 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
  failed: 'bg-error/10 text-error',
};

export interface JobStatusBadgeProps {
  status: string;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const className = STATUS_CLASSES[status] ?? 'bg-muted text-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium capitalize',
        className,
      )}
    >
      {status}
    </span>
  );
}
