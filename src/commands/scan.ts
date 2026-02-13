import { Command } from 'commander';
import { spawn } from 'child_process';
import { checkPeerDependency } from '../utils/dependencies.js';
import { logger } from '../utils/index.js';
import { findConfigPath } from '../utils/scannerConfig.js';

// Re-export for backwards compatibility
export { findConfigPath as getConfigPath } from '../utils/scannerConfig.js';

export interface RunScanOptions {
  /** Whether to show the intro box (default: true) */
  showIntro?: boolean;
  /** Whether to show the success box at the end (default: true) */
  showSuccessBox?: boolean;
}

/**
 * Run react-scanner as a child process
 * This function is exported so it can be reused by other commands (start, build)
 */
export async function runScan(options: RunScanOptions = {}): Promise<void> {
  const { showIntro = true, showSuccessBox = true } = options;

  const configPath = findConfigPath();

  if (!configPath) {
    logger.errorBox(
      'Configuration Not Found',
      `No ${logger.bold('react-scanner.config.js')} found.\nRun ${logger.bold('react-scanner-studio init')} first to create the configuration.`
    );
    throw new Error('Configuration not found');
  }

  if (showIntro) {
    logger.infoBox(
      'React Scanner Studio',
      'Scanning your codebase for component usage...'
    );
  }

  logger.startSpinner('Running react-scanner...');

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['react-scanner', '--config', configPath], {
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    // Handle SIGINT (Ctrl+C)
    const handleSignal = () => {
      child.kill('SIGTERM');
      logger.spinnerError('Scan cancelled');
      process.exit(1);
    };

    process.on('SIGINT', handleSignal);
    process.on('SIGTERM', handleSignal);

    child.on('close', code => {
      // Remove signal handlers
      process.off('SIGINT', handleSignal);
      process.off('SIGTERM', handleSignal);

      if (code === 0) {
        logger.spinnerSuccess('Scan completed successfully');

        if (showSuccessBox) {
          // Show output location info
          logger.successBox(
            'Scan Complete',
            `Component usage data has been generated.\n\nRun ${logger.bold('react-scanner-studio start')} to view the dashboard\nor ${logger.bold('react-scanner-studio build')} to generate static files.`
          );
        }
        resolve();
      } else {
        logger.spinnerError('Scan failed');

        // Filter out npm warnings and show only relevant error details
        const filterNpmWarnings = (text: string): string => {
          return text
            .split('\n')
            .filter(line => !line.startsWith('npm warn'))
            .join('\n')
            .trim();
        };

        const filteredStderr = filterNpmWarnings(stderr);
        const filteredStdout = filterNpmWarnings(stdout);
        const errorMessage =
          filteredStderr || filteredStdout || 'Unknown error occurred';
        logger.errorBox('Scan Error', errorMessage);
        reject(new Error(`react-scanner exited with code ${code}`));
      }
    });

    child.on('error', err => {
      // Remove signal handlers
      process.off('SIGINT', handleSignal);
      process.off('SIGTERM', handleSignal);

      logger.spinnerError('Failed to run react-scanner');
      logger.errorBox(
        'Scan Error',
        `Could not execute react-scanner.\n${err.message}`
      );
      reject(err);
    });
  });
}

export function scanCommand(program: Command): void {
  program
    .command('scan')
    .description('Scan your codebase for component usage using react-scanner')
    .action(async () => {
      checkPeerDependency();

      try {
        await runScan();
      } catch {
        process.exit(1);
      }
    });
}
