type Num = number | null | undefined;

export function formatMs(ms: Num): string {
  if (ms === null || ms === undefined) return '—';

  const absMs = Math.abs(ms);

  if (absMs < 1_000) return `${Math.round(ms)} ms`;
  if (absMs < 60_000) return `${(ms / 1_000).toFixed(1)} s`;
  if (absMs < 3_600_000) return `${(ms / 60_000).toFixed(1)}m`;

  return `${(ms / 3_600_000).toFixed(1)}h`;
}

export function formatDuration(seconds: Num): string {
  if (seconds === null || seconds === undefined) return '—';

  const totalSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function formatPercent(rate: Num): string {
  if (rate === null || rate === undefined) return '—';
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatCount(value: Num): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('en-US');
}

export function formatRate(perMinute: Num): string {
  if (perMinute === null || perMinute === undefined) return '—';
  return `${formatCount(perMinute)}/min`;
}
