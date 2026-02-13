import {
  createServer as createHttpServer,
  IncomingMessage,
  ServerResponse,
} from 'http';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getScanData } from '../utils/scannerConfig.js';
import { logger } from '../utils/index.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  logger.startSpinner('Starting development server...');

  // Dynamically import Vite to create dev server in middleware mode
  const { createServer: createViteServer } = await import('vite');

  const uiRoot = getUiRoot();

  // Create HTTP server first
  const server = createHttpServer();

  // Create Vite dev server with HMR configured to use our HTTP server
  // This ensures the WebSocket server uses the same port as the HTTP server
  const vite = await createViteServer({
    root: uiRoot,
    configFile: resolve(uiRoot, 'vite.config.ts'),
    server: {
      middlewareMode: true,
      hmr: {
        // Attach HMR WebSocket to our HTTP server instead of creating a new one
        server,
        port,
      },
    },
    appType: 'spa',
  });

  // Set up request handler
  server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
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
  });

  // Handle server errors
  server.on('error', (err: NodeJS.ErrnoException) => {
    logger.spinnerError('Server error');
    logger.errorBox('Server Error', err.message);
    vite.close();
    process.exit(1);
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down server...');
    await vite.close();
    server.close();
    logger.success('Server stopped gracefully');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return new Promise((resolvePromise, reject) => {
    server.on('error', reject);

    server.listen(port, '127.0.0.1', () => {
      logger.spinnerSuccess('Server started');
      logger.serverInfo(port, [
        'Hot Module Replacement enabled',
        'Press Ctrl+C to stop the server',
      ]);
      resolvePromise();
    });
  });
}
