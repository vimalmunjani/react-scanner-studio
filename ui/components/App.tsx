import { useEffect, useState, useCallback } from 'react';
import { ReportProvider, useReport } from '@/lib/report-context';
import { SplashScreen } from '@/components/splash-screen';
import { ThemeProvider } from '@/lib/theme-context';
import { NavigationProvider, useNavigation } from '@/lib/navigation-context';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { StatCards } from '@/components/dashboard/stat-cards';
import { UsageChart } from '@/components/dashboard/usage-chart';
import { TreemapChart } from '@/components/dashboard/treemap-chart';
import { ComponentDetail } from '@/components/dashboard/component-detail';
import { ComponentInventory } from '@/components/dashboard/component-inventory';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

function DashboardView() {
  return (
    <div className='flex flex-col gap-6'>
      <DashboardHeader />
      <StatCards />
      <UsageChart />
      <TreemapChart />
    </div>
  );
}

function InventoryView() {
  return <ComponentInventory />;
}

function MainContent() {
  const { loadReport } = useReport();
  const { page } = useNavigation();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Auto-load report from API on mount
  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch('/api/scan-data');
        const result = await response.json();
        if (result.data && !result.error) {
          loadReport(JSON.stringify(result.data));
        }
      } catch {
        // If fetch fails, user can still manually load a report
        console.log(
          'No scan data available from server, manual input required'
        );
      }
    }
    fetchReport();
  }, [loadReport]);

  if (showSplash) {
    return (
      <SplashScreen minDuration={2000} onComplete={handleSplashComplete} />
    );
  }

  return (
    <SidebarProvider defaultOpen={true} className='h-screen overflow-hidden'>
      <AppSidebar />
      <SidebarInset className='overflow-hidden'>
        <header className='flex items-center gap-2 h-12 px-4 border-b border-border shrink-0'>
          <SidebarTrigger className='-ml-1' />
        </header>
        <div className='flex-1 overflow-y-auto overflow-x-hidden'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            {page === 'dashboard' && <DashboardView />}
            {page === 'inventory' && <InventoryView />}
          </div>
        </div>
      </SidebarInset>
      <ComponentDetail />
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ReportProvider>
        <NavigationProvider>
          <MainContent />
        </NavigationProvider>
      </ReportProvider>
    </ThemeProvider>
  );
}
