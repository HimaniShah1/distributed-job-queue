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
