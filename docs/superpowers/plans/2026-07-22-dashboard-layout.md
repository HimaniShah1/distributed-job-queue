# Dashboard Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the structural shell of the Queue Engine dashboard (`DashboardLayout`, `Sidebar`, `Header`, content container) matching the attached design reference, with no widgets/tables/charts/GraphQL wiring.

**Architecture:** Fill the existing empty stub files under `apps/dashboard/src/dashboard/layout/` with small, composable components driven by two constants files (`navigation.ts`, `dashboard.ts`). Remap the app's dark theme CSS variables to the exact CLAUDE.md palette. Wire `App.tsx` to render the new `DashboardPage`.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (`base-nova` style, built on `@base-ui/react` primitives — **not** Radix), Lucide icons.

## Global Constraints

- Working directory for all commands/paths below: `apps/dashboard/`.
- No test framework (vitest/jest/RTL) is configured in this project, and CLAUDE.md forbids introducing new libraries unless explicitly asked. **Verification substitutes TDD's red/green cycle with: TypeScript typecheck (`npx tsc -p tsconfig.app.json`) after every task, plus a visual check in the dev server** (via the Browser tool) at the milestone tasks called out below. This is a deliberate, spec-approved adaptation — not a shortcut.
- Icons: Lucide only, 18–20px, `strokeWidth={1.75}` (outline, non-filled), per CLAUDE.md.
- Colors: use the CLAUDE.md palette exactly — background `#111111`, sidebar `#0D0D0D`, surface `#171717`, border `#2A2A2A`, primary text `#F2F2F2`, muted text `#9D9D9D`, success `#79C27A`, warning `#C6B26A`, error `#C96B6B`, info `#6F8FB5`.
- No new npm dependencies beyond the shadcn components added in Task 1 (all sourced from the already-installed `shadcn` CLI / `@base-ui/react` / `lucide-react`).
- Do not touch `apps/dashboard/src/dashboard/kpi/`, `hooks/`, `graphql/`, or `gql/` — out of scope.
- Folder structure is fixed by `apps/dashboard/CLAUDE.md`: dashboard code stays under `src/dashboard/`, no new top-level folders.
- Base URL for all file paths below: `apps/dashboard/`.

---

### Task 1: Install shadcn UI primitives

**Files:**
- Create: `@/components/ui/input.tsx`, `@/components/ui/dropdown-menu.tsx`, `@/components/ui/avatar.tsx`, `@/components/ui/separator.tsx`

**Interfaces:**
- Produces: `Input` (from `@/components/ui/input`); `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator` (from `@/components/ui/dropdown-menu`); `Avatar`, `AvatarFallback` (from `@/components/ui/avatar`, `Avatar` takes `size?: "default" | "sm" | "lg"`); `Separator` (from `@/components/ui/separator`).

These files already exist in the working tree from research done during planning (verified against the real `base-nova`/`@base-ui/react` generated API — `DropdownMenuTrigger` uses a `render` prop, not Radix's `asChild`). This task just verifies and commits them.

- [ ] **Step 1: Verify the four files exist**

Run: `ls @/components/ui/`
Expected output includes: `avatar.tsx  button.tsx  dropdown-menu.tsx  input.tsx  separator.tsx`

If any are missing, run: `node_modules/.bin/shadcn add input dropdown-menu avatar separator -y`

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p tsconfig.app.json`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add @/components/ui/input.tsx @/components/ui/dropdown-menu.tsx @/components/ui/avatar.tsx @/components/ui/separator.tsx
git commit -m "feat(dashboard): add shadcn input, dropdown-menu, avatar, separator primitives"
```

---

### Task 2: Remap dark theme palette and remove leftover template CSS

**Files:**
- Modify: `src/index.css`
- Modify: `index.html`

**Interfaces:**
- Produces: Tailwind utility classes `bg-success`/`text-success` (and `warning`/`error`/`info` equivalents) resolving to the CLAUDE.md status colors in dark mode; `<html class="dark">` so the app boots in dark mode.
- Consumes: nothing.

The current `.dark` block in `src/index.css` uses generic shadcn oklch grays, not the CLAUDE.md hex palette. The `#root`, `h1`, `h2` rules are leftover from the Vite starter template (centered 1126px marketing layout, 56px hero `h1`) and will visually break a full-bleed dashboard shell — they must be removed so Tailwind utility classes on the new components control layout/typography instead.

- [ ] **Step 1: Replace the `:root` block's status-color additions**

In `src/index.css`, inside the `:root { ... }` block, add these four lines directly before the closing `}` (after the `--sidebar-ring` line):

```css
  --success: #2f9e44;
  --warning: #b98900;
  --error: #c92a2a;
  --info: #3b6fa0;
```

- [ ] **Step 2: Replace the entire `.dark { ... }` block**

Replace the existing `.dark { ... }` block (currently the oklch-gray shadcn defaults) with:

```css
.dark {
  --background: #111111;
  --foreground: #f2f2f2;
  --card: #171717;
  --card-foreground: #f2f2f2;
  --popover: #171717;
  --popover-foreground: #f2f2f2;
  --primary: #f2f2f2;
  --primary-foreground: #111111;
  --secondary: #1c1c1c;
  --secondary-foreground: #f2f2f2;
  --muted: #1a1a1a;
  --muted-foreground: #9d9d9d;
  --accent: #1f1f1f;
  --accent-foreground: #f2f2f2;
  --destructive: #c96b6b;
  --border: #2a2a2a;
  --input: #2a2a2a;
  --ring: #3a3a3a;
  --chart-1: #79c27a;
  --chart-2: #6f8fb5;
  --chart-3: #c6b26a;
  --chart-4: #c96b6b;
  --chart-5: #9d9d9d;
  --sidebar: #0d0d0d;
  --sidebar-foreground: #f2f2f2;
  --sidebar-primary: #f2f2f2;
  --sidebar-primary-foreground: #111111;
  --sidebar-accent: #1a1a1a;
  --sidebar-accent-foreground: #f2f2f2;
  --sidebar-border: #2a2a2a;
  --sidebar-ring: #3a3a3a;
  --success: #79c27a;
  --warning: #c6b26a;
  --error: #c96b6b;
  --info: #6f8fb5;
}
```

- [ ] **Step 3: Map the new status colors into Tailwind's `@theme inline` block**

In `src/index.css`, inside `@theme inline { ... }`, add these four lines near the other `--color-*` mappings (right after `--color-background: var(--background);`):

```css
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-error: var(--error);
  --color-info: var(--info);
```

- [ ] **Step 4: Remove the leftover Vite-template layout/typography rules**

In `src/index.css`, delete these three rule blocks entirely (they predate the dashboard and conflict with it):

```css
#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
```

```css
h1,
h2 {
  font-family: var(--heading);
  font-weight: 500;
  color: var(--text-h);
}

h1 {
  font-size: 56px;
  letter-spacing: -1.68px;
  margin: 32px 0;
  @media (max-width: 1024px) {
    font-size: 36px;
    margin: 20px 0;
  }
}
h2 {
  font-size: 24px;
  line-height: 118%;
  letter-spacing: -0.24px;
  margin: 0 0 8px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
}
```

Leave `p { margin: 0; }`, `code`/`.counter` rules, and the `@layer base` block untouched.

- [ ] **Step 5: Boot the app in dark mode**

In `index.html`, change:

```html
<html lang="en">
```

to:

```html
<html lang="en" class="dark">
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc -p tsconfig.app.json`
Expected: no output, exit code 0.

- [ ] **Step 7: Commit**

```bash
git add src/index.css index.html
git commit -m "feat(dashboard): remap dark theme to CLAUDE.md palette, remove template CSS"
```

---

### Task 3: Navigation and page constants

**Files:**
- Create: `src/dashboard/constants/navigation.ts`
- Create: `src/dashboard/constants/dashboard.ts`

**Interfaces:**
- Produces: `interface NavItemData { label: string; href: string; icon: LucideIcon }`, `interface NavSection { label: string; items: NavItemData[] }`, `NAV_SECTIONS: NavSection[]`, `ACTIVE_HREF: string` (from `navigation.ts`); `DASHBOARD_TITLE: string`, `DASHBOARD_SUBTITLE: string` (from `dashboard.ts`).
- Consumes: nothing.

- [ ] **Step 1: Write `src/dashboard/constants/navigation.ts`**

```typescript
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
```

- [ ] **Step 2: Write `src/dashboard/constants/dashboard.ts`**

```typescript
export const DASHBOARD_TITLE = 'Dashboard';
export const DASHBOARD_SUBTITLE = 'Overview of your queue system';
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -p tsconfig.app.json`
Expected: no output, exit code 0.

- [ ] **Step 4: Commit**

```bash
git add src/dashboard/constants/navigation.ts src/dashboard/constants/dashboard.ts
git commit -m "feat(dashboard): add navigation and page constants"
```

---

### Task 4: Sidebar atoms — Logo, NavItem, SidebarSection

**Files:**
- Create: `src/dashboard/layout/Logo.tsx`
- Create: `src/dashboard/layout/NavItem.tsx`
- Create: `src/dashboard/layout/SidebarSection.tsx`

**Interfaces:**
- Consumes: nothing directly (no dependency on Task 3's constants — they take props).
- Produces: `Logo(): JSX.Element`; `NavItem({ label, icon, active }: { label: string; icon: LucideIcon; active?: boolean }): JSX.Element`; `SidebarSection({ label, children }: { label: string; children: ReactNode }): JSX.Element`.

- [ ] **Step 1: Write `src/dashboard/layout/Logo.tsx`**

```tsx
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
```

- [ ] **Step 2: Write `src/dashboard/layout/NavItem.tsx`**

```tsx
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
```

- [ ] **Step 3: Write `src/dashboard/layout/SidebarSection.tsx`**

```tsx
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
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc -p tsconfig.app.json`
Expected: no output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/layout/Logo.tsx src/dashboard/layout/NavItem.tsx src/dashboard/layout/SidebarSection.tsx
git commit -m "feat(dashboard): add Logo, NavItem, SidebarSection components"
```

---

### Task 5: SystemStatusCard

**Files:**
- Create: `src/dashboard/layout/SystemStatusCard.tsx`

**Interfaces:**
- Consumes: nothing (static content, per design spec — no live data).
- Produces: `SystemStatusCard(): JSX.Element`.

- [ ] **Step 1: Write `src/dashboard/layout/SystemStatusCard.tsx`**

```tsx
export function SystemStatusCard() {
  return (
    <div className="hidden flex-col gap-2 rounded-md border border-sidebar-border bg-card px-3 py-2.5 lg:flex">
      <span className="text-xs font-medium text-muted-foreground">System Status</span>
      <div className="flex flex-col gap-1.5 text-sm text-foreground">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-success" />
          <span>Healthy</span>
        </div>
        <span className="pl-3.5 text-xs text-muted-foreground">PostgreSQL</span>
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-success" />
          <span>Connected</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground/70">Last updated: 10s ago</span>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p tsconfig.app.json`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/dashboard/layout/SystemStatusCard.tsx
git commit -m "feat(dashboard): add SystemStatusCard"
```

---

### Task 6: Sidebar assembly

**Files:**
- Create: `src/dashboard/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: `Logo`, `NavItem`, `SidebarSection` (Task 4), `SystemStatusCard` (Task 5), `NAV_SECTIONS`, `ACTIVE_HREF` (Task 3), `Avatar`, `AvatarFallback` (Task 1).
- Produces: `Sidebar(): JSX.Element`.

- [ ] **Step 1: Write `src/dashboard/layout/Sidebar.tsx`**

```tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NAV_SECTIONS, ACTIVE_HREF } from '../constants/navigation';
import { Logo } from './Logo';
import { NavItem } from './NavItem';
import { SidebarSection } from './SidebarSection';
import { SystemStatusCard } from './SystemStatusCard';

export function Sidebar() {
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
                icon={item.icon}
                active={item.href === ACTIVE_HREF}
              />
            ))}
          </SidebarSection>
        ))}
      </nav>

      <SystemStatusCard />

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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p tsconfig.app.json`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/dashboard/layout/Sidebar.tsx
git commit -m "feat(dashboard): assemble Sidebar"
```

---

### Task 7: ThemeToggle

**Files:**
- Create: `src/dashboard/layout/ThemeToggle.tsx`

**Interfaces:**
- Consumes: `Button` (from `@/components/ui/button`, already exists).
- Produces: `ThemeToggle(): JSX.Element`.

- [ ] **Step 1: Write `src/dashboard/layout/ThemeToggle.tsx`**

```tsx
import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  }

  return (
    <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
      {isDark ? (
        <Sun className="size-4" strokeWidth={1.75} />
      ) : (
        <Moon className="size-4" strokeWidth={1.75} />
      )}
    </Button>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p tsconfig.app.json`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/dashboard/layout/ThemeToggle.tsx
git commit -m "feat(dashboard): add ThemeToggle"
```

---

### Task 8: Header assembly

**Files:**
- Create: `src/dashboard/layout/Header.tsx`

**Interfaces:**
- Consumes: `Input` (Task 1), `DropdownMenu`/`DropdownMenuTrigger`/`DropdownMenuContent`/`DropdownMenuItem`/`DropdownMenuSeparator` (Task 1), `Avatar`/`AvatarFallback` (Task 1), `Button` (existing), `ThemeToggle` (Task 7).
- Produces: `Header(): JSX.Element`.

Note the `render` prop on `DropdownMenuTrigger` (this project's `base-nova`/`@base-ui/react` shadcn style uses `render`, not Radix's `asChild`) — confirmed by reading the generated `@/components/ui/dropdown-menu.tsx` file directly.

- [ ] **Step 1: Write `src/dashboard/layout/Header.tsx`**

```tsx
import { Search, RefreshCw, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from './ThemeToggle';

const TIME_RANGES = ['Last hour', 'Last 24 hours', 'Last 7 days', 'Last 30 days'];

export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 lg:px-6">
      <div className="relative w-full max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input placeholder="Search" className="pr-12 pl-8" />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
            <RefreshCw className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Auto sync</span>
            <span className="flex items-center gap-1 text-success">
              <span className="size-1.5 rounded-full bg-success" />
              On
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>On</DropdownMenuItem>
            <DropdownMenuItem>Off</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
            <Calendar className="size-4" strokeWidth={1.75} />
            <span>Last 24 hours</span>
            <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {TIME_RANGES.map((range) => (
              <DropdownMenuItem key={range}>{range}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2" />}>
            <Avatar size="sm">
              <AvatarFallback className="bg-secondary text-foreground">JP</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm text-foreground sm:inline">Jaylon Philips</span>
            <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p tsconfig.app.json`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/dashboard/layout/Header.tsx
git commit -m "feat(dashboard): assemble Header"
```

---

### Task 9: DashboardLayout assembly

**Files:**
- Create: `src/dashboard/layout/DashboardLayout.tsx`

**Interfaces:**
- Consumes: `Sidebar` (Task 6), `Header` (Task 8).
- Produces: `DashboardLayout({ children }: { children: ReactNode }): JSX.Element`.

- [ ] **Step 1: Write `src/dashboard/layout/DashboardLayout.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-svh w-full bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p tsconfig.app.json`
Expected: no output, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/dashboard/layout/DashboardLayout.tsx
git commit -m "feat(dashboard): assemble DashboardLayout"
```

---

### Task 10: Wire DashboardPage, App, and barrels; final visual verification

**Files:**
- Modify: `src/dashboard/pages/DashboardPage.tsx`
- Modify: `src/dashboard/layout/index.ts`
- Modify: `src/dashboard/index.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `DashboardLayout` (Task 9), `DASHBOARD_TITLE`/`DASHBOARD_SUBTITLE` (Task 3).
- Produces: `DashboardPage(): JSX.Element` as the app's root view.

- [ ] **Step 1: Write `src/dashboard/pages/DashboardPage.tsx`**

```tsx
import { DashboardLayout } from '../layout/DashboardLayout';
import { DASHBOARD_TITLE, DASHBOARD_SUBTITLE } from '../constants/dashboard';

export function DashboardPage() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold text-foreground">{DASHBOARD_TITLE}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{DASHBOARD_SUBTITLE}</p>
    </DashboardLayout>
  );
}
```

- [ ] **Step 2: Write `src/dashboard/layout/index.ts`**

```typescript
export { DashboardLayout } from './DashboardLayout';
export { Sidebar } from './Sidebar';
export { Header } from './Header';
export { Logo } from './Logo';
export { NavItem } from './NavItem';
export { SidebarSection } from './SidebarSection';
export { SystemStatusCard } from './SystemStatusCard';
export { ThemeToggle } from './ThemeToggle';
```

- [ ] **Step 3: Write `src/dashboard/index.ts`**

```typescript
export { DashboardPage } from './pages/DashboardPage';
```

- [ ] **Step 4: Replace `src/App.tsx`**

The current `App.tsx` renders an ad-hoc Apollo health-check placeholder left over from GraphQL scaffolding — replace it with the dashboard root:

```tsx
import { DashboardPage } from './dashboard';

function App() {
  return <DashboardPage />;
}

export default App;
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc -p tsconfig.app.json`
Expected: no output, exit code 0.

- [ ] **Step 6: Start the dev server and visually verify against the reference design**

Run: `npm run dev` (leave running)

Using the Browser tool, navigate to the printed local URL and check, at desktop width (1280px+):
- Sidebar renders dark (`#0D0D0D`) with Logo, 4 sections (Overview/Operations/Monitoring/System) with the exact nav items from the spec, System Status card, and the Jaylon Philips/Administrator footer.
- Header renders Search input with ⌘K hint, Auto Sync dropdown (green dot + "On"), Time Range dropdown ("Last 24 hours"), theme toggle, and user dropdown — each dropdown opens on click and closes on outside click/Escape.
- Content area shows only "Dashboard" title + "Overview of your queue system" subtitle, otherwise empty.
- Overall background/surface/border colors match the CLAUDE.md hex palette (spot-check with browser devtools or the `read_page`/screenshot tools).

Then resize to tablet (768px) and mobile (375px) widths and verify:
- Sidebar collapses to icon-only rail (no clipped text, nav still usable via icons).
- Header wraps its controls onto a second row instead of overflowing/clipping.

Fix any visual discrepancies found before proceeding.

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/dashboard/pages/DashboardPage.tsx src/dashboard/layout/index.ts src/dashboard/index.ts src/App.tsx
git commit -m "feat(dashboard): wire DashboardPage as app root"
```

---

## Self-Review Notes

- **Spec coverage:** Sidebar sections/items (Task 3/6), Logo/System Status/User profile (Task 4-6), Header search/dropdowns/theme toggle/user dropdown (Task 7-8), content area title/subtitle only (Task 10), responsive collapse (Task 4/6 `lg:` classes, verified Task 10), shadcn usage (Task 1), Lucide icons (Task 3-8), small reusable components (Tasks 4-7) — all covered. Explicitly-excluded items (KPI cards, charts, tables, activity feed, queue/worker lists, GraphQL, mock data) have no corresponding task.
- **Type consistency:** `NavItemData`/`NavSection` (Task 3) match the props `NavItem` (Task 4) and `SidebarSection` (Task 4) accept, consumed identically in `Sidebar` (Task 6). `DASHBOARD_TITLE`/`DASHBOARD_SUBTITLE` (Task 3) match usage in `DashboardPage` (Task 10). `DashboardLayoutProps.children` (Task 9) matches how `DashboardPage` calls it (Task 10).
- **No placeholders:** every step has complete, runnable code; no TBD/TODO markers.
