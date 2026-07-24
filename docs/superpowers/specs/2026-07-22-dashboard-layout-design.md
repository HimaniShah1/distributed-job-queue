# Dashboard Layout Design

## Goal
Build the structural shell of the Queue Engine dashboard — `DashboardLayout`, `Sidebar`, `Header`, and the content container — matching the attached design reference. No widgets, charts, tables, or GraphQL wiring; those are separate future work.

## Scope
In scope: layout components listed below, nav constants, dark theme color remap, shadcn primitives needed for the header/sidebar chrome.
Out of scope: KPI cards, charts, tables, activity feed, queue list, worker list, GraphQL data, mock data.

## Architecture

```
dashboard/layout/
├── DashboardLayout.tsx    grid shell: Sidebar + (Header + main content column)
├── Sidebar.tsx            fixed-width dark rail
├── SidebarSection.tsx     reusable: uppercase muted label + NavItems
├── NavItem.tsx            reusable: icon + label, active/inactive state
├── Logo.tsx               icon + "Queue Engine" wordmark
├── SystemStatusCard.tsx   static "Healthy / PostgreSQL / Connected" card
├── Header.tsx             search input, auto-sync + time-range dropdowns, theme toggle, user dropdown
└── ThemeToggle.tsx        sun/moon button, toggles `dark` class locally
```

- `constants/navigation.ts` — nav tree (section label, items with icon + label) driving `Sidebar`.
- `constants/dashboard.ts` — page title/subtitle strings.
- `DashboardPage.tsx` renders `<DashboardLayout><h1>{title}</h1><p>{subtitle}</p>{children}</DashboardLayout>`; content area otherwise empty.

Sidebar nav (from spec):
- Overview: Dashboard
- Operations: Queues, Jobs, Workers, Schedules
- Monitoring: Metrics, Alerts
- System: Settings, Integrations, API Keys

## shadcn components
Only `Button` exists today. Add via the `shadcn` CLI (already a devDependency), matching the configured `base-nova` style: `Input`, `DropdownMenu`, `Avatar`, `Separator`.

## Theming
`src/index.css`'s `.dark` block uses generic shadcn oklch grays. Remap to the CLAUDE.md palette:
- `--background: #111111`
- `--sidebar: #0D0D0D`
- `--card: #171717` (surface)
- `--border: #2A2A2A`
- `--foreground: #F2F2F2`
- `--muted-foreground: #9D9D9D`
- Add status vars: success `#79C27A`, warning `#C6B26A`, error `#C96B6B`, info `#6F8FB5`

Light theme (`:root`) is untouched. App defaults to dark mode (`class="dark"` on root) to match the reference image.

## Dropdowns
Auto Sync, Time Range, and User Profile dropdowns in the header are functional `DropdownMenu` triggers (open/close) with static placeholder items — no data wiring or persisted state.

## Responsive
- Sidebar collapses to icon-only rail below `lg` breakpoint.
- Header wraps search/controls onto a second row on narrow viewports.
- Content column stays fluid width.

## Icons
Lucide only, 18–20px, outline (non-filled) style, consistent with CLAUDE.md.
