import { DashboardLayout } from '../layout/DashboardLayout';
import { DASHBOARD_TITLE, DASHBOARD_SUBTITLE } from '../constants/dashboard';
import { KPIGrid } from '../kpi';
import { MetricsOverview } from '../metrics';

export function DashboardPage() {
  return (
    <DashboardLayout>
      {({ stats, loading, error, metrics, metricsLoading, metricsError }) => (
        <>
          <h1 className="text-2xl font-semibold text-foreground">{DASHBOARD_TITLE}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{DASHBOARD_SUBTITLE}</p>
          <div className="mt-6">
            <KPIGrid stats={stats} loading={loading} error={error} />
          </div>
          <div className="mt-6">
            <MetricsOverview metrics={metrics} loading={metricsLoading} error={metricsError} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
