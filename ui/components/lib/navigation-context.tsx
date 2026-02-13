import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export type Page = 'dashboard' | 'inventory' | 'code-owners' | 'monorepo-usage';

interface NavigationContextValue {
  page: Page;
  setPage: (page: Page) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [page, setPageState] = useState<Page>('dashboard');

  const setPage = useCallback((p: Page) => {
    setPageState(p);
  }, []);

  return (
    <NavigationContext.Provider value={{ page, setPage }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return ctx;
}
