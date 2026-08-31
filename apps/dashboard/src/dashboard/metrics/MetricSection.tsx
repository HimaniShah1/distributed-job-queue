import type { ReactNode } from 'react';

export interface MetricSectionProps {
  title: string;
  children: ReactNode;
}

export function MetricSection({ title, children }: MetricSectionProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
      <span className="mb-1 text-sm font-medium text-foreground">{title}</span>
      <div className="flex flex-col divide-y divide-border">{children}</div>
    </div>
  );
}
