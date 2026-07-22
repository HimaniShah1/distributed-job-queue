import type { ReactNode } from 'react';

interface SidebarSectionProps {
  label: string;
  children: ReactNode;
}

export function SidebarSection({ label, children }: SidebarSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="hidden px-2.5 text-xs font-medium tracking-wide text-muted-foreground/70 uppercase lg:block">
        {label}
      </span>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
