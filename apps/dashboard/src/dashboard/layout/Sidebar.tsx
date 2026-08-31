import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePathname } from '@/lib/router';
import { NAV_SECTIONS } from '../constants/navigation';
import { Logo } from './Logo';
import { NavItem } from './NavItem';
import { SidebarSection } from './SidebarSection';
import { SystemStatusCard } from './SystemStatusCard';

interface SidebarProps {
  lastUpdatedAt: Date | undefined;
}

export function Sidebar({ lastUpdatedAt }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-16 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar px-2 py-4 lg:w-60 lg:px-3">
      <Logo />

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <SidebarSection key={section.label} label={section.label}>
            {section.items.map((item) => (
              <NavItem
                key={item.href}
                label={item.label}
                href={item.href}
                icon={item.icon}
                active={item.href === pathname}
              />
            ))}
          </SidebarSection>
        ))}
      </nav>

      <SystemStatusCard lastUpdatedAt={lastUpdatedAt} />

      <div className="flex items-center gap-2.5 border-t border-sidebar-border pt-3">
        <Avatar>
          <AvatarFallback className="bg-secondary text-foreground">JP</AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 flex-col lg:flex">
          <span className="truncate text-sm font-medium text-foreground">Jaylon Philips</span>
          <span className="truncate text-xs text-muted-foreground">Administrator</span>
        </div>
      </div>
    </aside>
  );
}
