import { DashboardLayout } from '../layout/DashboardLayout';
import { JOBS_TITLE, JOBS_SUBTITLE } from '../constants/dashboard';
import { CreateJobForm, DemoWorkloadButton, RecentJobsList } from '../jobs';

export function JobsPage() {
  return (
    <DashboardLayout>
      {({ recentJobs, recentJobsLoading, recentJobsError }) => (
        <>
          <h1 className="text-2xl font-semibold text-foreground">{JOBS_TITLE}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{JOBS_SUBTITLE}</p>
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CreateJobForm />
            <DemoWorkloadButton />
          </div>
          <div className="mt-6">
            <RecentJobsList jobs={recentJobs} loading={recentJobsLoading} error={recentJobsError} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
