import { useState, useEffect } from 'react';
import { ComponentTable } from './components/ComponentTable';
import './App.css';

export interface ScanData {
  [componentName: string]: {
    instances: number;
    props?: Record<string, number>;
  };
}

interface ApiResponse {
  data: ScanData | null;
  error: string | null;
}

function App() {
  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scan-data')
      .then((res) => res.json())
      .then((result: ApiResponse) => {
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch scan data: ' + err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <h1>React Scanner UI</h1>
      {loading && <div className="loading">Loading scan data...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && data && <ComponentTable data={data} />}
      {!loading && !error && !data && (
        <div className="error">No component data found.</div>
      )}
    </div>
  );
}

export default App;
