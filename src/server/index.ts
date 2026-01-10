import {
  createServer as createHttpServer,
  IncomingMessage,
  ServerResponse,
} from "http";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import polka from "polka";
import { getScanData } from "../utils/scannerConfig";

/**
 * Get the path to the UI directory.
 * Works both in development (src/) and production (dist/)
 */
function getUiRoot(): string {
  // __dirname will be either src/server or dist/server
  // UI is always at project-root/ui
  const currentDir = __dirname;

  // Go up from server/ to src/ or dist/, then up to project root, then into ui/
  return resolve(currentDir, "../../ui");
}

/**
 * Start the HTTP server using Polka with Vite middleware mode
 * (similar approach to Storybook's builder-vite)
 */
export async function startServer(port: number): Promise<void> {
  const server = createHttpServer();
  const app = polka({ server });

  // API endpoint to get scan data (served before Vite middleware)
  app.get("/api/scan-data", (_req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Content-Type", "application/json");
    const result = getScanData();
    res.end(JSON.stringify(result));
  });

  // Dynamically import Vite to create dev server in middleware mode
  const { createServer: createViteServer } = await import("vite");

  const uiRoot = getUiRoot();

  const vite = await createViteServer({
    root: uiRoot,
    configFile: resolve(uiRoot, "vite.config.ts"),
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
    },
    appType: "spa",
  });

  // Use Vite's connect instance as middleware
  app.use(
    vite.middlewares as unknown as (
      req: IncomingMessage,
      res: ServerResponse,
      next: () => void,
    ) => void,
  );

  // Handle server errors
  server.on("error", (err: NodeJS.ErrnoException) => {
    console.error("Server error:", err);
    vite.close();
    process.exit(1);
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log("\nShutting down...");
    await vite.close();
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  return new Promise((resolve, reject) => {
    server.on("error", reject);

    app.listen({ port, host: "127.0.0.1" }, () => {
      console.log(
        `\n🚀 React Scanner UI is running at http://localhost:${port}\n`,
      );
      console.log("   ➜  Hot Module Replacement enabled");
      console.log("   ➜  Press Ctrl+C to stop the server.\n");
      resolve();
    });
  });
}
