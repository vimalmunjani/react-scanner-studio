import { Command } from "commander";
import { createInterface } from "readline";
import { checkPeerDependency } from "../utils/dependencies";
import { getServerPort, isPortAvailable } from "../utils/port";
import { startServer } from "../server";

const DEFAULT_PORT = 3000;

/**
 * Prompt user to confirm using a different port (like Storybook does)
 */
async function promptForPortChange(
  requestedPort: number,
  availablePort: number,
): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      `Port ${requestedPort} is not available. Would you like to run on port ${availablePort} instead? (Y/n): `,
      (answer) => {
        rl.close();
        const normalizedAnswer = answer.trim().toLowerCase();
        // Default to yes if user just presses enter
        resolve(
          normalizedAnswer === "" ||
            normalizedAnswer === "y" ||
            normalizedAnswer === "yes",
        );
      },
    );
  });
}

/**
 * Open the browser to the given URL
 */
async function openBrowser(url: string): Promise<void> {
  const { platform } = process;

  try {
    const { exec } = await import("child_process");

    let command: string;
    if (platform === "darwin") {
      command = `open "${url}"`;
    } else if (platform === "win32") {
      command = `start "" "${url}"`;
    } else {
      // Linux and other platforms
      command = `xdg-open "${url}"`;
    }

    exec(command, (error) => {
      if (error) {
        console.log(
          `Could not open browser automatically. Please visit: ${url}`,
        );
      }
    });
  } catch {
    console.log(`Could not open browser automatically. Please visit: ${url}`);
  }
}

export function startCommand(program: Command): void {
  program
    .command("start")
    .description("Start the React Scanner UI server")
    .option(
      "-p, --port <number>",
      "Port to run the server on",
      String(DEFAULT_PORT),
    )
    .option(
      "--exact-port",
      "Exit if the specified port is not available",
      false,
    )
    .option("--ci", "Run in CI mode (no interactive prompts)", false)
    .option("--open", "Open the browser automatically", false)
    .action(async (options) => {
      checkPeerDependency();

      const requestedPort = parseInt(options.port, 10);

      if (isNaN(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
        console.error(
          "Error: Invalid port number. Please specify a port between 1 and 65535.",
        );
        process.exit(1);
      }

      // Use detect-port to find an available port
      const availablePort = await getServerPort(requestedPort, {
        exactPort: options.exactPort,
      });

      // If port changed and not in CI mode, prompt user
      if (
        availablePort !== requestedPort &&
        !options.ci &&
        !options.exactPort
      ) {
        const shouldChangePort = await promptForPortChange(
          requestedPort,
          availablePort,
        );

        if (!shouldChangePort) {
          console.log("Exiting.");
          process.exit(1);
        }
      } else if (availablePort !== requestedPort && options.ci) {
        // In CI mode, just log the port change
        console.log(
          `Port ${requestedPort} is not available. Using port ${availablePort} instead.`,
        );
      }

      try {
        await startServer(availablePort);

        // Open browser if --open flag is set
        if (options.open) {
          const url = `http://localhost:${availablePort}`;
          await openBrowser(url);
        }
      } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
      }
    });
}
