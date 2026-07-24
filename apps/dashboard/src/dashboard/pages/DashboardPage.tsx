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
