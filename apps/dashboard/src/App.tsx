import { useQuery } from '@apollo/client/react';
import { HEALTH_QUERY } from './graphql/queries/health';

function App() {
 const { loading, error, data } = useQuery(HEALTH_QUERY);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  if (!data) {
    return <p>No data received.</p>;
  }

  return (
    <div>
      <h1>Distributed Job Queue Dashboard</h1>

      <p>Status: {data.health.status}</p>
      <p>Uptime: {data.health.uptime}</p>
    </div>
  );
}

export default App;