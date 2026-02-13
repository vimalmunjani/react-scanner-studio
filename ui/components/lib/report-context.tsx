import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { NormalizedReport, NormalizedComponent } from './report-types';
import { parseReport } from './report-parser';

interface ReportContextValue {
  report: NormalizedReport | null;
  error: string | null;
  loadReport: (jsonString: string) => void;
  clearReport: () => void;
  selectedComponent: NormalizedComponent | null;
  setSelectedComponent: (component: NormalizedComponent | null) => void;
}

const ReportContext = createContext<ReportContextValue | null>(null);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [report, setReport] = useState<NormalizedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] =
    useState<NormalizedComponent | null>(null);

  const loadReport = useCallback((jsonString: string) => {
    try {
      const parsed = parseReport(jsonString);
      setReport(parsed);
      setError(null);
      setSelectedComponent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse report.');
      setReport(null);
    }
  }, []);

  const clearReport = useCallback(() => {
    setReport(null);
    setError(null);
    setSelectedComponent(null);
  }, []);

  return (
    <ReportContext.Provider
      value={{
        report,
        error,
        loadReport,
        clearReport,
        selectedComponent,
        setSelectedComponent,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return ctx;
}
