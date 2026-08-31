import { cn } from '@/lib/utils';

export type MetricTone = 'default' | 'success' | 'warning' | 'error' | 'info';

const TONE_TEXT_CLASSES: Record<MetricTone, string> = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

export interface MetricRowProps {
  label: string;
  value: string;
  tone?: MetricTone;
}

export function MetricRow({ label, value, tone = 'default' }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium tabular-nums', TONE_TEXT_CLASSES[tone])}>{value}</span>
    </div>
  );
}
