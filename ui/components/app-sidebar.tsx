import {
  LayoutDashboard,
  Package,
  BookOpen,
  Play,
  ExternalLink,
  Users,
  Boxes,
} from 'lucide-react';
import { useNavigation, type Page } from '@/lib/navigation-context';
import { useReport } from '@/lib/report-context';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS: {
  id: Page;
  label: string;
  icon: typeof LayoutDashboard;
  comingSoon?: boolean;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Component Inventory', icon: Package },
  { id: 'code-owners', label: 'Code Owners', icon: Users, comingSoon: true },
  {
    id: 'monorepo-usage',
    label: 'Usage by Packages',
    icon: Boxes,
    comingSoon: true,
  },
];

const EXTERNAL_LINKS = [
  {
    label: 'Documentation',
    icon: BookOpen,
    href: 'https://reactscanner.studio/',
  },
  {
    label: 'Demo',
    icon: Play,
    href: 'https://demo.reactscanner.studio/',
  },
];

export function AppSidebar() {
  const { page, setPage } = useNavigation();
  const { report } = useReport();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='py-4'>
        <div className='flex items-center gap-2.5 px-2'>
          <img
            src='/logo.png'
            alt='React Scanner Studio'
            className='w-5 h-5 rounded'
          />
          {!collapsed && (
            <div className='flex flex-col min-w-0'>
              <span className='text-sm font-semibold text-sidebar-foreground truncate'>
                React Scanner Studio
              </span>
              {report && (
                <span className='text-[10px] text-muted-foreground font-mono truncate'>
                  {report.totalUniqueComponents} components
                </span>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = page === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => !item.comingSoon && setPage(item.id)}
                      tooltip={item.label}
                      className={
                        item.comingSoon ? 'cursor-not-allowed opacity-60' : ''
                      }
                    >
                      <Icon className='w-4 h-4' />
                      <span>{item.label}</span>
                      {item.comingSoon && !collapsed && (
                        <Badge
                          variant='outline'
                          className='ml-auto text-[9px] px-1 py-0'
                        >
                          Soon
                        </Badge>
                      )}
                      {item.id === 'inventory' && report && !collapsed && (
                        <Badge
                          variant='secondary'
                          className='ml-auto text-[10px] px-1.5 py-0 tabular-nums'
                        >
                          {report.totalUniqueComponents}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {report && !collapsed && (
          <SidebarGroup className='py-0'>
            <SidebarGroupLabel>Report Info</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className='flex flex-col gap-1.5 px-2 pb-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-[11px] text-muted-foreground'>
                    Format
                  </span>
                  <span className='text-[11px] font-mono text-sidebar-foreground'>
                    {report.format}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-[11px] text-muted-foreground'>
                    Instances
                  </span>
                  <span className='text-[11px] tabular-nums text-sidebar-foreground'>
                    {report.totalInstances.toLocaleString()}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-[11px] text-muted-foreground'>
                    Props
                  </span>
                  <span className='text-[11px] tabular-nums text-sidebar-foreground'>
                    {report.totalUniqueProps.toLocaleString()}
                  </span>
                </div>
                {report.totalFiles > 0 && (
                  <div className='flex items-center justify-between'>
                    <span className='text-[11px] text-muted-foreground'>
                      Files
                    </span>
                    <span className='text-[11px] tabular-nums text-sidebar-foreground'>
                      {report.totalFiles.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className='py-0'>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {EXTERNAL_LINKS.map(link => {
                const Icon = link.icon;
                return (
                  <SidebarMenuItem key={link.label}>
                    <SidebarMenuButton asChild tooltip={link.label}>
                      <a
                        href={link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className={
                          collapsed ? 'flex items-center justify-center' : ''
                        }
                      >
                        <Icon className='w-4 h-4 ml-2' />
                        <span>{link.label}</span>
                        {!collapsed && (
                          <ExternalLink className='w-3 h-3 ml-auto text-muted-foreground' />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className='flex items-center justify-center px-1 pb-1 border-t border-sidebar-border pt-2'>
          <ThemeSwitcher collapsed={collapsed} />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
