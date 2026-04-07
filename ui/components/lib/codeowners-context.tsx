import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { CodeownersReport, OwnerStats } from './report-types';

interface CodeownersContextValue {
  codeownersReport: CodeownersReport | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  selectedOwner: OwnerStats | null;
  setSelectedOwner: (owner: OwnerStats | null) => void;
}

const CodeownersContext = createContext<CodeownersContextValue>({
  codeownersReport: null,
  isLoading: false,
  error: null,
  refetch: () => {},
  selectedOwner: null,
  setSelectedOwner: () => {},
});

export function CodeownersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [codeownersReport, setCodeownersReport] =
    useState<CodeownersReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<OwnerStats | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/codeowners-data');
      const result = await response.json();
      if (result.data) {
        setCodeownersReport(result.data);
      } else {
        setCodeownersReport(null);
      }
    } catch {
      // Server not available (e.g. static build without codeowners)
      setCodeownersReport(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <CodeownersContext.Provider
      value={{
        codeownersReport,
        isLoading,
        error,
        refetch: fetchData,
        selectedOwner,
        setSelectedOwner,
      }}
    >
      {children}
    </CodeownersContext.Provider>
  );
}

export function useCodeowners() {
  return useContext(CodeownersContext);
}
