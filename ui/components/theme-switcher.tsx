import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function ThemeSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const Icon = theme === 'dark' ? Moon : Sun;
  const label = theme === 'dark' ? 'Dark' : 'Light';

  if (collapsed) {
    return (
      <button
        type='button'
        onClick={toggle}
        className='flex items-center justify-center w-8 h-8 rounded-md hover:bg-sidebar-accent transition-colors'
        title={`Theme: ${label}`}
      >
        <Icon className='w-4 h-4 text-sidebar-foreground' />
        <span className='sr-only'>Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      type='button'
      onClick={toggle}
      className='flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors'
    >
      <Icon className='w-4 h-4' />
      <span>{label} mode</span>
    </button>
  );
}
