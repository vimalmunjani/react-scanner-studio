import { createServer } from 'net';
import * as logger from './logger.js';

export interface PortOptions {
  exactPort?: boolean;
}

/**
 * Check if a port is available by actually trying to bind to it
 */
function checkPort(port: number, host: string = '127.0.0.1'): Promise<boolean> {
  return new Promise(resolve => {
    const server = createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        // Other errors - assume port is not available
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port, host);
  });
}

/**
 * Find an available port starting from the given port
 * Tries up to maxAttempts ports sequentially
 */
async function findAvailablePort(
  startPort: number,
  host: string = '127.0.0.1',
  maxAttempts: number = 100
): Promise<number | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (port > 65535) {
      break;
    }
    const isAvailable = await checkPort(port, host);
    if (isAvailable) {
      return port;
    }
  }
  return null;
}

/**
 * Get an available server port
 * If the requested port is busy, it will find the next available port
 * unless exactPort is set to true, in which case it will exit
 */
export async function getServerPort(
  port: number = 3000,
  { exactPort }: PortOptions = {}
): Promise<number> {
  const host = '127.0.0.1';

  // First check if requested port is available
  const isRequestedPortAvailable = await checkPort(port, host);

  if (isRequestedPortAvailable) {
    return port;
  }

  // Port is not available
  if (exactPort) {
    logger.errorBox(
      'Port Unavailable',
      `Port ${logger.bold(String(port))} is not available.\nUse a different port or remove the --exact-port flag.`
    );
    process.exit(1);
  }

  // Find next available port
  const availablePort = await findAvailablePort(port + 1, host);

  if (availablePort === null) {
    logger.errorBox(
      'Port Detection Error',
      `Could not find an available port starting from ${port}.`
    );
    process.exit(1);
  }

  return availablePort;
}

/**
 * Check if a port is available
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  return checkPort(port, '127.0.0.1');
}
