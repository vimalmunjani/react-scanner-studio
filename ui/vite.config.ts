import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: resolve(__dirname),
  server: {
    // Port is configured dynamically by the server when running in middleware mode
    open: false,
  },
  appType: 'spa',
  resolve: {
    alias: {
      '@/components': resolve(__dirname, 'components'),
      '@/lib': resolve(__dirname, 'components/lib'),
      '@/hooks': resolve(__dirname, 'components/hooks'),
    },
  },
  build: {
    outDir: resolve(__dirname, '../dist/ui'),
    emptyOutDir: true,
  },
});
