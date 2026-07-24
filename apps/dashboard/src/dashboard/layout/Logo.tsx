import { Hexagon } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 px-1">
      <Hexagon className="size-5 shrink-0 text-foreground" strokeWidth={1.75} />
      <span className="hidden truncate text-sm font-semibold text-foreground lg:inline">
        Queue Engine
      </span>
    </div>
  );
}
