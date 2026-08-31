import { useEffect } from 'react';

import { DashboardPage, JobsPage } from './dashboard';
import { navigate, usePathname } from './lib/router';

function App() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [pathname]);

  if (pathname === '/jobs') {
    return <JobsPage />;
  }

  return <DashboardPage />;
}

export default App;
