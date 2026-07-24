import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Layers,
  ListChecks,
  Users,
  CalendarClock,
  ChartLine,
  BellRing,
  Settings,
  Plug,
  KeyRound,
} from 'lucide-react';

export interface NavItemData {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItemData[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Queues', href: '/queues', icon: Layers },
      { label: 'Jobs', href: '/jobs', icon: ListChecks },
      { label: 'Workers', href: '/workers', icon: Users },
      { label: 'Schedules', href: '/schedules', icon: CalendarClock },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { label: 'Metrics', href: '/metrics', icon: ChartLine },
      { label: 'Alerts', href: '/alerts', icon: BellRing },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Integrations', href: '/integrations', icon: Plug },
      { label: 'API Keys', href: '/api-keys', icon: KeyRound },
    ],
  },
];

export const ACTIVE_HREF = '/';
