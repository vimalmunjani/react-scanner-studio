import {
  createServer as createHttpServer,
  IncomingMessage,
  ServerResponse,
} from 'http';
import { resolve } from 'path';
import { getScanData } from '../utils/scannerConfig';

/**
 * Get the path to the UI directory.
 * Works both in development (src/) and production (dist/)
 */
function getUiRoot(): string {
  // __dirname will be either src/server or dist/server
  // UI is always at project-root/ui
  const currentDir = __dirname;

  // Go up from server/ to src/ or dist/, then up to project root, then into ui/
  return resolve(currentDir, '../../ui');
}

/**
 * Start the HTTP server using Polka with Vite middleware mode
 * (similar approach to Storybook's builder-vite)
 */
export async function startServer(port: number): Promise<void> {
  // Dynamically import Vite to create dev server in middleware mode
  const { createServer: createViteServer } = await import('vite');

  const uiRoot = getUiRoot();

  const vite = await createViteServer({
    root: uiRoot,
    configFile: resolve(uiRoot, 'vite.config.ts'),
    server: {
      middlewareMode: true,
    },
    appType: 'spa',
  });

  // Create HTTP server with manual routing
  const server = createHttpServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const url = req.url || '';

      // Handle API routes FIRST - before Vite middleware
      if (url === '/api/scan-data' || url.startsWith('/api/scan-data?')) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        const result = await getScanData();
        res.end(JSON.stringify(result));
        return;
      }

      // Pass everything else to Vite
      vite.middlewares(req, res);
    }
  );

  // Handle server errors
  server.on('error', (err: NodeJS.ErrnoException) => {
    console.error('Server error:', err);
    vite.close();
    process.exit(1);
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down...');
    await vite.close();
    server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return new Promise((resolvePromise, reject) => {
    server.on('error', reject);

    server.listen(port, '127.0.0.1', () => {
      console.log(
        `\n🚀 React Scanner UI is running at http://localhost:${port}\n`
      );
      console.log('   ➜  Hot Module Replacement enabled');
      console.log('   ➜  Press Ctrl+C to stop the server.\n');
      resolvePromise();
    });
  });
}
