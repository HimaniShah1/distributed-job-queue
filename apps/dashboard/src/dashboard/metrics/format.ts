type Num = number | null | undefined;

export function formatMs(ms: Num): string {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
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
