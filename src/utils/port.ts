import detectPort from "detect-port";

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
  { exactPort }: PortOptions = {},
): Promise<number> {
  try {
    const freePort = await detectPort(port);

    if (freePort !== port && exactPort) {
      console.error(`Error: Port ${port} is not available.`);
      process.exit(1);
    }

    return freePort;
  } catch (error) {
    console.error("Error detecting available port:", error);
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
