# Dashboard Auto Sync Polling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Header's "Auto Sync" toggle a real control over `dashboardStats` polling (via Apollo's `pollInterval`), and replace `SystemStatusCard`'s hardcoded "Last updated: 10s ago" with the actual timestamp of the last successful fetch.

**Architecture:** `Header`'s Auto Sync toggle and `SystemStatusCard`'s "Last updated" line are siblings of the KPI content — neither is an ancestor/descendant of the other, and neither was previously wired to any data. Rather than introduce a global store, the single `useDashboardStats` call moves up to `DashboardLayout` — the true common ancestor of `Sidebar` (which renders `SystemStatusCard`), `Header`, and the main content column (which renders `KPIGrid`) — and its results are threaded down as plain props: `autoSync`/`onAutoSyncChange` to `Header`, `lastUpdatedAt` to `Sidebar`→`SystemStatusCard`, and `stats`/`loading`/`error` to the content column via a render-prop `children` function. `KPIGrid` changes from self-fetching to purely props-driven — this is the one real architectural change this plan makes, and it's the minimum needed given three sibling subtrees now need the same live query result without a global store.

**Tech Stack:** React 19, TypeScript, Apollo Client v4 (`@apollo/client/react`), existing Tailwind/shadcn styling (unchanged).

## Global Constraints

- No test framework configured; verification per task substitutes `npx tsc -p tsconfig.app.json` (typecheck) + `npm run lint`; the final task adds a manual browser check.
- No new npm dependencies.
- No global state (no Context provider, no Zustand/Redux, no Apollo `reactiveVar`) — state lives in `DashboardLayout` (the real common ancestor of every consumer) and flows down via props, exactly as the rest of this codebase already does (e.g. `NAV_SECTIONS` driving `Sidebar`).
- Polling must use Apollo Client's own `pollInterval` option on `useQuery` — this is Apollo's built-in equivalent of manual `startPolling`/`stopPolling`: passing a positive number starts polling at that interval, passing `0` stops it, and changing the value between renders is fully reactive (Apollo calls `startPolling`/`stopPolling` internally). Do not implement a custom `setInterval`/timer.
- We are not implementing WebSockets, GraphQL subscriptions, or real-time streaming. Polling only.
- The polling interval must be a named constant, not a magic number, so it's easy to change later.
- Preserve all existing visual styling — every existing Tailwind className in touched files stays as-is unless a step below explicitly changes it (only 3 small, explicitly-listed style changes: the Auto Sync trigger's on/off dot+text color, driven by real state instead of being hardcoded to "On"/green).
- Auto Sync OFF must not clear `stats`/`lastUpdatedAt` — the last-fetched values stay on screen exactly as they were until the user flips Auto Sync back on (Apollo naturally does this: stopping polling doesn't clear the cache or `data`).
- This is Apollo Client v4: `useQuery`'s hooks live at `@apollo/client/react`, NOT the older top-level `@apollo/client` path (already the established convention in this codebase — see `main.tsx`'s `ApolloProvider` import and `useDashboardStats.ts`'s existing `useQuery` import). `NetworkStatus` is exported from the top-level `@apollo/client` package (confirmed via `node_modules/@apollo/client/core/index.d.ts`).
- Apollo Client v4's `useQuery` does NOT have `onCompleted`/`onError` callback options (removed from v4) — "a fetch just completed" must be detected via `networkStatus === NetworkStatus.ready` (with `notifyOnNetworkStatusChange: true` so status transitions are actually surfaced to the component), not via an `onCompleted` callback and not by watching `data` for reference changes (Apollo's cache may return the same `data` reference across polls when nothing changed, which would silently break "update the timestamp on every fetch").
- Setting `notifyOnNetworkStatusChange: true` makes Apollo's raw `loading` flag turn `true` during every poll-driven refetch, not just the very first fetch — left unguarded, this would make the whole KPI grid flash back to skeletons every 10 seconds. The hook must expose `loading: loading && !data` (true only when there is genuinely no data yet) so `KPIGrid`'s existing skeleton behavior is preserved exactly as before, with zero flicker on background polls.
- Working directory for all commands: `apps/dashboard/`.
- Out of scope — do NOT build: WebSockets/subscriptions, a manual refresh button, changing SystemStatusCard's "Healthy"/"PostgreSQL"/"Connected" content (that stays fully static — only the "Last updated" line changes), an immediate forced refetch when Auto Sync is re-enabled (Apollo's declarative `pollInterval` toggle is sufficient — do not add an extra manual `refetch()` call on the enable-edge), distinguishing "initial load error" from "a later poll's transient error" (KPIGrid's existing error-banner-replaces-everything behavior is unchanged).

---

## File Structure

```
apps/dashboard/src/dashboard/
├── constants/dashboard.ts        [MODIFY] add AUTO_SYNC_POLL_INTERVAL_MS
├── hooks/useDashboardStats.ts    [MODIFY] accept autoSync param, add polling + lastUpdatedAt
├── layout/
│   ├── DashboardLayout.tsx       [MODIFY] own autoSync state, call the hook, thread props down
│   ├── Sidebar.tsx               [MODIFY] accept + forward lastUpdatedAt prop
│   ├── SystemStatusCard.tsx      [MODIFY] accept lastUpdatedAt prop, render real timestamp
│   └── Header.tsx                [MODIFY] accept autoSync/onAutoSyncChange props, wire dropdown
├── kpi/KPIGrid.tsx               [MODIFY] becomes props-driven (stats/loading/error as props)
└── pages/DashboardPage.tsx       [MODIFY] use DashboardLayout's render-prop children
```

---

### Task 1: Poll interval constant + `useDashboardStats` hook changes

**Files:**
- Modify: `apps/dashboard/src/dashboard/constants/dashboard.ts`
- Modify: `apps/dashboard/src/dashboard/hooks/useDashboardStats.ts`

**Interfaces:**
- Produces: `AUTO_SYNC_POLL_INTERVAL_MS: number` (10_000); `useDashboardStats(autoSync: boolean): { stats: DashboardStatsQuery['dashboardStats'] | undefined; loading: boolean; error: ErrorLike | undefined; lastUpdatedAt: Date | undefined }` — consumed by `DashboardLayout` in Task 4.

- [ ] **Step 1: Add the poll interval constant**

Replace the contents of `apps/dashboard/src/dashboard/constants/dashboard.ts`:

```ts
export const DASHBOARD_TITLE = 'Dashboard';
export const DASHBOARD_SUBTITLE = 'Overview of your queue system';
export const AUTO_SYNC_POLL_INTERVAL_MS = 10_000;
```

- [ ] **Step 2: Rewrite the hook**

Replace the contents of `apps/dashboard/src/dashboard/hooks/useDashboardStats.ts`:

```ts
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { NetworkStatus } from '@apollo/client';

import { DASHBOARD_STATS_QUERY } from '../../graphql/queries/dashboard-stats';
import { AUTO_SYNC_POLL_INTERVAL_MS } from '../constants/dashboard';

export function useDashboardStats(autoSync: boolean) {
  const { data, loading, error, networkStatus } = useQuery(DASHBOARD_STATS_QUERY, {
    pollInterval: autoSync ? AUTO_SYNC_POLL_INTERVAL_MS : 0,
    notifyOnNetworkStatusChange: true,
  });

  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (networkStatus === NetworkStatus.ready) {
      setLastUpdatedAt(new Date());
    }
  }, [networkStatus]);

  return {
    stats: data?.dashboardStats,
    loading: loading && !data,
    error,
    lastUpdatedAt,
  };
}
```

Note on `loading: loading && !data`: this is deliberate, not a simplification of the brief — see Global Constraints for why raw Apollo `loading` cannot be used directly once `notifyOnNetworkStatusChange: true` is set.

- [ ] **Step 3: Typecheck**

From `apps/dashboard/`:

```bash
npx tsc -p tsconfig.app.json
```

Expected: this will FAIL at this step, because `KPIGrid.tsx` still calls `useDashboardStats()` with zero arguments (the old signature). That's expected — Task 1 changes the hook's signature; the call site isn't updated until Task 4. Confirm the ONLY error is an arity mismatch on the `useDashboardStats()` call in `KPIGrid.tsx` (e.g. "Expected 1 arguments, but got 0") — if there are any OTHER errors, stop and report NEEDS_CONTEXT.

- [ ] **Step 4: Commit**

```bash
git add src/dashboard/constants/dashboard.ts src/dashboard/hooks/useDashboardStats.ts
git commit -m "feat(dashboard): add auto-sync polling and last-updated tracking to useDashboardStats"
```

---

### Task 2: `SystemStatusCard` + `Sidebar` — thread `lastUpdatedAt` down, render real timestamp

**Files:**
- Modify: `apps/dashboard/src/dashboard/layout/SystemStatusCard.tsx`
- Modify: `apps/dashboard/src/dashboard/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: nothing new from other tasks — `lastUpdatedAt` will be supplied by `DashboardLayout` in Task 4, but this task just adds the prop plumbing; it compiles standalone since `Sidebar`'s only caller (`DashboardLayout`) isn't updated until Task 4 (typecheck will show an arity/prop error there until Task 4 lands — same situation as Task 1's Step 3).
- Produces: `SystemStatusCard({ lastUpdatedAt }: { lastUpdatedAt: Date | undefined })`; `Sidebar({ lastUpdatedAt }: { lastUpdatedAt: Date | undefined })` — both consumed by `DashboardLayout` in Task 4.

- [ ] **Step 1: Update SystemStatusCard**

Replace the contents of `apps/dashboard/src/dashboard/layout/SystemStatusCard.tsx`:

```tsx
interface SystemStatusCardProps {
  lastUpdatedAt: Date | undefined;
}

export function SystemStatusCard({ lastUpdatedAt }: SystemStatusCardProps) {
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
      <span className="text-xs text-muted-foreground/70">
        Last updated: {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : '—'}
      </span>
    </div>
  );
}
```

Only the final `<span>` changed — everything else (Healthy/PostgreSQL/Connected block) is untouched, per Global Constraints.

- [ ] **Step 2: Update Sidebar to accept and forward the prop**

In `apps/dashboard/src/dashboard/layout/Sidebar.tsx`, make these two changes:

1. Change the function signature from `export function Sidebar() {` to:

```tsx
interface SidebarProps {
  lastUpdatedAt: Date | undefined;
}

export function Sidebar({ lastUpdatedAt }: SidebarProps) {
```

2. Change `<SystemStatusCard />` to `<SystemStatusCard lastUpdatedAt={lastUpdatedAt} />`.

Nothing else in the file changes — same nav rendering, same user footer.

- [ ] **Step 3: Typecheck**

From `apps/dashboard/`:

```bash
npx tsc -p tsconfig.app.json
```

Expected: still fails, but ONLY on `DashboardLayout.tsx`'s `<Sidebar />` call (missing the now-required `lastUpdatedAt` prop) plus the same `KPIGrid.tsx` arity error from Task 1. If any other errors appear, stop and report NEEDS_CONTEXT.

- [ ] **Step 4: Commit**

```bash
git add src/dashboard/layout/SystemStatusCard.tsx src/dashboard/layout/Sidebar.tsx
git commit -m "feat(dashboard): thread lastUpdatedAt into SystemStatusCard"
```

---

### Task 3: `Header` — real Auto Sync toggle

**Files:**
- Modify: `apps/dashboard/src/dashboard/layout/Header.tsx`

**Interfaces:**
- Produces: `Header({ autoSync, onAutoSyncChange }: { autoSync: boolean; onAutoSyncChange: (value: boolean) => void })` — consumed by `DashboardLayout` in Task 4.

- [ ] **Step 1: Rewrite Header**

Replace the contents of `apps/dashboard/src/dashboard/layout/Header.tsx`:

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
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

const TIME_RANGES = ['Last hour', 'Last 24 hours', 'Last 7 days', 'Last 30 days'];

interface HeaderProps {
  autoSync: boolean;
  onAutoSyncChange: (value: boolean) => void;
}

export function Header({ autoSync, onAutoSyncChange }: HeaderProps) {
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
            <span
              className={cn(
                'flex items-center gap-1',
                autoSync ? 'text-success' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  autoSync ? 'bg-success' : 'bg-muted-foreground',
                )}
              />
              {autoSync ? 'On' : 'Off'}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAutoSyncChange(true)}>On</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAutoSyncChange(false)}>Off</DropdownMenuItem>
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

Everything except the Auto Sync `DropdownMenuTrigger`/`DropdownMenuContent` block (and the new `cn` import) is byte-for-byte identical to the current file — the Time Range dropdown, ThemeToggle, and user dropdown are untouched.

- [ ] **Step 2: Typecheck**

From `apps/dashboard/`:

```bash
npx tsc -p tsconfig.app.json
```

Expected: still fails, but ONLY on `DashboardLayout.tsx`'s `<Header />` call (missing the now-required props) plus the same pre-existing errors from Tasks 1–2 (`KPIGrid.tsx` arity, `Sidebar` missing prop). If any other errors appear, stop and report NEEDS_CONTEXT.

- [ ] **Step 3: Commit**

```bash
git add src/dashboard/layout/Header.tsx
git commit -m "feat(dashboard): wire Header Auto Sync toggle to real state"
```

---

### Task 4: Wire it all together — `DashboardLayout`, `DashboardPage`, `KPIGrid`

This is the task where everything from Tasks 1–3 gets connected. It must be one task: `DashboardLayout`'s new render-prop shape, `DashboardPage`'s new usage of it, and `KPIGrid`'s new props-driven interface are three interdependent pieces that only compile together — splitting them would leave an intermediate broken state with no meaningful task boundary to review independently.

**Files:**
- Modify: `apps/dashboard/src/dashboard/layout/DashboardLayout.tsx`
- Modify: `apps/dashboard/src/dashboard/pages/DashboardPage.tsx`
- Modify: `apps/dashboard/src/dashboard/kpi/KPIGrid.tsx`

**Interfaces:**
- Consumes: `useDashboardStats(autoSync)` (Task 1); `Sidebar({ lastUpdatedAt })` (Task 2); `Header({ autoSync, onAutoSyncChange })` (Task 3); `DashboardStatsQuery` type from `../../gql/graphql` (already existed before this plan).
- Produces: `DashboardLayout`'s `children` prop now accepts `ReactNode | ((props: { stats: DashboardStatsQuery['dashboardStats'] | undefined; loading: boolean; error: ErrorLike | undefined }) => ReactNode)`; `KPIGrid({ stats, loading, error }: KPIGridProps)` (no longer calls `useDashboardStats` itself).

- [ ] **Step 1: Rewrite DashboardLayout**

Replace the contents of `apps/dashboard/src/dashboard/layout/DashboardLayout.tsx`:

```tsx
import { useState, type ReactNode } from 'react';
import type { ErrorLike } from '@apollo/client';

import type { DashboardStatsQuery } from '../../gql/graphql';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface DashboardContentProps {
  stats: DashboardStatsQuery['dashboardStats'] | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
}

interface DashboardLayoutProps {
  children: ReactNode | ((props: DashboardContentProps) => ReactNode);
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [autoSync, setAutoSync] = useState(true);
  const { stats, loading, error, lastUpdatedAt } = useDashboardStats(autoSync);

  return (
    <div className="flex min-h-svh w-full bg-background text-foreground">
      <Sidebar lastUpdatedAt={lastUpdatedAt} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header autoSync={autoSync} onAutoSyncChange={setAutoSync} />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
          {typeof children === 'function' ? children({ stats, loading, error }) : children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite KPIGrid to be props-driven**

Replace the contents of `apps/dashboard/src/dashboard/kpi/KPIGrid.tsx`:

```tsx
import { Activity, Clock, CircleCheck, TriangleAlert, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ErrorLike } from '@apollo/client';

import type { DashboardStatsQuery } from '../../gql/graphql';
import { StatCard, type StatCardTone } from './StatCard';

type DashboardStats = DashboardStatsQuery['dashboardStats'];

interface KPICardConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  tone: StatCardTone;
  getValue: (stats: DashboardStats) => number;
}

const KPI_CARDS: KPICardConfig[] = [
  { key: 'pending', label: 'Pending Jobs', icon: Clock, tone: 'warning', getValue: (stats) => stats.jobs.pending },
  { key: 'processing', label: 'Processing', icon: Activity, tone: 'warning', getValue: (stats) => stats.jobs.processing },
  { key: 'completed', label: 'Completed', icon: CircleCheck, tone: 'success', getValue: (stats) => stats.jobs.completed },
  { key: 'failed', label: 'Failed Jobs', icon: TriangleAlert, tone: 'error', getValue: (stats) => stats.jobs.failed },
  { key: 'workers', label: 'Active Workers', icon: Users, tone: 'info', getValue: (stats) => stats.workers.active },
];

interface KPIGridProps {
  stats: DashboardStats | undefined;
  loading: boolean;
  error: ErrorLike | undefined;
}

export function KPIGrid({ stats, loading, error }: KPIGridProps) {
  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-error/40 bg-error/10 p-4 text-sm text-error">
        Failed to load dashboard stats: {error.message}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
      aria-busy={loading}
    >
      {KPI_CARDS.map((card) => (
        <StatCard
          key={card.key}
          label={card.label}
          icon={card.icon}
          tone={card.tone}
          value={stats ? card.getValue(stats) : undefined}
          loading={loading}
        />
      ))}
    </div>
  );
}
```

The only changes from the current file: the `useDashboardStats` import and call are removed, a `KPIGridProps` interface is added, and the component destructures `{ stats, loading, error }` from props instead of from the hook. The config array, error banner, and grid JSX are unchanged.

- [ ] **Step 3: Rewrite DashboardPage**

Replace the contents of `apps/dashboard/src/dashboard/pages/DashboardPage.tsx`:

```tsx
import { DashboardLayout } from '../layout/DashboardLayout';
import { DASHBOARD_TITLE, DASHBOARD_SUBTITLE } from '../constants/dashboard';
import { KPIGrid } from '../kpi';

export function DashboardPage() {
  return (
    <DashboardLayout>
      {({ stats, loading, error }) => (
        <>
          <h1 className="text-2xl font-semibold text-foreground">{DASHBOARD_TITLE}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{DASHBOARD_SUBTITLE}</p>
          <div className="mt-6">
            <KPIGrid stats={stats} loading={loading} error={error} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
```

- [ ] **Step 4: Typecheck and lint**

From `apps/dashboard/`:

```bash
npx tsc -p tsconfig.app.json
npm run lint
```

Expected: both exit 0, no errors (all the intermediate errors from Tasks 1–3's steps should now be resolved — this task is what makes everything compile together again). If anything still fails, read the error carefully; it likely means a prop name or type doesn't line up between two of the four files touched across Tasks 1–4 — fix it directly rather than guessing.

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/layout/DashboardLayout.tsx src/dashboard/kpi/KPIGrid.tsx src/dashboard/pages/DashboardPage.tsx
git commit -m "feat(dashboard): wire auto-sync state through DashboardLayout to Header, Sidebar, and KPIGrid"
```

---

### Task 5: Final visual verification

**Files:** none (verification only — fix anything found before committing, then commit any fixes).

- [ ] **Step 1: Start the full stack**

From the repo root (`/Users/himanishah/Desktop/distributed-job-queue/.claude/worktrees/dashboard-layout`):

```bash
docker compose up -d
npm run api
```

From `apps/dashboard/` (separate terminal/background):

```bash
npm run dev
```

- [ ] **Step 2: Verify polling starts and the timestamp updates**

Open the dashboard in a browser. Confirm:
- The Auto Sync trigger shows a green dot + "On" by default.
- Open the browser's network tab (or use `read_network_requests` if using the Browser tool) and confirm a `dashboardStats` GraphQL request fires roughly every 10 seconds while Auto Sync is On.
- `SystemStatusCard`'s "Last updated" line shows a real clock time (not "10s ago"), and that time advances each time a poll completes (wait at least 20 seconds and confirm it changed at least once).
- KPI cards do NOT flash back to skeleton/loading state on each poll — they should only show skeletons on the very first load.

- [ ] **Step 3: Verify turning Auto Sync off stops polling and freezes values**

Click the Auto Sync dropdown, select "Off". Confirm:
- The trigger updates to show a muted dot + "Off".
- No further `dashboardStats` network requests fire (watch the network tab for at least 20 seconds — zero new requests).
- The KPI card values and the "Last updated" timestamp stay exactly as they were at the moment of toggling off — they do not clear, blank out, or reset.

- [ ] **Step 4: Verify turning Auto Sync back on resumes polling**

Click the Auto Sync dropdown, select "On" again. Confirm:
- The trigger goes back to green dot + "On".
- Polling resumes (a new `dashboardStats` request appears within about 10 seconds).
- The "Last updated" timestamp advances again once that request completes.

- [ ] **Step 5: Regression-check the rest of the dashboard**

Confirm nothing else broke: Time Range dropdown, theme toggle, and user dropdown in the Header still open/close correctly; Sidebar nav, System Status card's "Healthy"/"PostgreSQL"/"Connected" rows, and the user footer still render exactly as before; KPI grid still shows all 5 cards with correct icons/tones/values; responsive behavior (sidebar collapse, header wrap) is unaffected.

- [ ] **Step 6: Fix any discrepancies, then stop background processes**

Fix anything found, re-run Steps 2–5 until clean. Stop `npm run dev` and `npm run api`; `docker compose` can stay running.

- [ ] **Step 7: Commit any fixes** (skip if Steps 2–5 were clean)

```bash
git add -A
git commit -m "fix(dashboard): address auto-sync visual verification findings"
```

---

## Self-Review Notes (for the plan author, not a task step)

- **Spec coverage:** Auto Sync toggle is a real control (Task 3) driving `pollInterval` (Task 1) ✓; 10s polling via Apollo's built-in mechanism, not a custom timer (Task 1) ✓; Off disables polling and freezes on-screen values (Task 1's `pollInterval: autoSync ? N : 0`, Apollo's native behavior — no code needed to "freeze" anything, it's what NOT polling already does) ✓; hardcoded "Last updated: 10s ago" replaced with the real last-successful-fetch time, updating on every fetch including polls (Task 1's `networkStatus`-based tracking, Task 2's rendering) ✓; Header's toggle actually reflects/controls polling, not just decorative (Task 3 + Task 4's wiring) ✓; no global state — traced the full data flow and confirmed `DashboardLayout` is a genuine common ancestor of all three consumers, so lifting state there is standard prop-drilling, not a new state layer ✓; polling interval is a named constant (Task 1) ✓; existing component architecture/styling preserved except the one necessary structural change (`KPIGrid` becoming props-driven) and the three explicitly-listed Auto Sync trigger style changes ✓; no WebSockets/subscriptions anywhere in this plan ✓.
- **Placeholder scan:** no TBD/TODO; every step has complete code.
- **Type consistency:** `useDashboardStats(autoSync: boolean)` (Task 1's signature) matches its only call site in `DashboardLayout.tsx` (Task 4). `Sidebar({ lastUpdatedAt })` (Task 2) matches `<Sidebar lastUpdatedAt={lastUpdatedAt} />` in `DashboardLayout.tsx` (Task 4). `Header({ autoSync, onAutoSyncChange })` (Task 3) matches `<Header autoSync={autoSync} onAutoSyncChange={setAutoSync} />` in `DashboardLayout.tsx` (Task 4) — `setAutoSync` from `useState<boolean>` has signature `(value: boolean) => void`, matching `onAutoSyncChange`'s declared type exactly. `KPIGridProps` (Task 4) matches `<KPIGrid stats={stats} loading={loading} error={error} />` in `DashboardPage.tsx` (Task 4), and those three values match the shape `DashboardLayout`'s render-prop function passes (Task 4). `ErrorLike` (from `@apollo/client`) is used consistently as the error type across `DashboardLayout.tsx` and `KPIGrid.tsx`.
- **Intermediate-failure design note:** Tasks 1–3 are deliberately designed to leave the branch in a non-compiling state until Task 4 lands (each task's own Step 3/2 typecheck instruction explicitly names the *expected* remaining errors and tells the implementer to verify no *other* errors snuck in). This is called out explicitly in each task rather than hidden, so an implementer or reviewer doesn't mistake "expected, named, temporary breakage" for a mistake.
