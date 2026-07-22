import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

export function NavItem({ label, icon: Icon, active = false }: NavItemProps) {
  return (
    <a
      href="#"
      onClick={(event) => event.preventDefault()}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
      <span className="hidden truncate lg:inline">{label}</span>
    </a>
  );
}
