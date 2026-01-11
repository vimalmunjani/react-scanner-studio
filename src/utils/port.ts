import detectPort from 'detect-port';
import * as logger from './logger.js';

export interface PortOptions {
  exactPort?: boolean;
}

/**
 * Get an available server port using detect-port (same approach as Storybook)
 * If the requested port is busy, it will find the next available port
 * unless exactPort is set to true, in which case it will exit
 */
export async function getServerPort(
  port: number = 3000,
  { exactPort }: PortOptions = {}
): Promise<number> {
  try {
    const freePort = await detectPort(port);

    if (freePort !== port && exactPort) {
      logger.errorBox(
        'Port Unavailable',
        `Port ${logger.bold(String(port))} is not available.\nUse a different port or remove the --exact-port flag.`
      );
      process.exit(1);
    }

    return freePort;
  } catch (error) {
    logger.errorBox(
      'Port Detection Error',
      `Failed to detect available port: ${error}`
    );
    process.exit(1);
  }
}

/**
 * Check if a port is available
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  try {
    const freePort = await detectPort(port);
    return freePort === port;
  } catch {
    return false;
  }
}
