import { Command } from 'commander';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, isAbsolute, dirname } from 'path';
import { createRequire } from 'module';
import { checkPeerDependency } from '../utils/dependencies.js';
import { logger } from '../utils/index.js';
import { findConfigPath } from '../utils/scannerConfig.js';

const require = createRequire(import.meta.url);

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
      `No ${logger.bold('react-scanner.config.*')} found.\nRun ${logger.bold('react-scanner-studio init')} first to create the configuration.`
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

  // Handle all config files by transforming them with jiti to ensure compatibility
  // with react-scanner's loader (especially for ESM/TypeScript/etc)
  let finalConfigPath = configPath;
  let tempConfigPath: string | null = null;

  try {
    const { createJiti } = require('jiti');
    const jiti = createJiti(import.meta.url);
    const configContent = await jiti.import(configPath);
    const config = configContent.default || configContent;

    const originalConfigDir = dirname(configPath);

    // Resolve relative paths to absolute paths to prevent issues with temp file location
    if (
      config.crawlFrom &&
      typeof config.crawlFrom === 'string' &&
      !isAbsolute(config.crawlFrom)
    ) {
      config.crawlFrom = resolve(originalConfigDir, config.crawlFrom);
    }

    if (Array.isArray(config.processors)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config.processors = config.processors.map((p: any) => {
        if (
          Array.isArray(p) &&
          p[1] &&
          p[1].outputTo &&
          typeof p[1].outputTo === 'string' &&
          !isAbsolute(p[1].outputTo)
        ) {
          const processorConfig = { ...p[1] };
          processorConfig.outputTo = resolve(originalConfigDir, p[1].outputTo);
          return [p[0], processorConfig];
        }
        return p;
      });
    }

    const tempDir = join(process.cwd(), '.react-scanner-studio', 'temp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    tempConfigPath = join(
      tempDir,
      `react-scanner.config.tmp-${Date.now()}.cjs`
    );

    // Simple serialization for config object
    const serialize = (obj: unknown): string => {
      if (obj instanceof RegExp) return obj.toString();
      if (typeof obj === 'function') return obj.toString();
      if (Array.isArray(obj))
        return `[${obj.map(item => serialize(item)).join(', ')}]`;
      if (typeof obj === 'object' && obj !== null) {
        return `{ ${Object.entries(obj)
          .map(([k, v]) => `"${k}": ${serialize(v)}`)
          .join(', ')} }`;
      }
      return JSON.stringify(obj);
    };

    const serializedConfig = `module.exports = ${serialize(config)};`;

    writeFileSync(tempConfigPath, serializedConfig);
    finalConfigPath = tempConfigPath;
  } catch (error) {
    logger.spinnerError('Failed to process configuration file');
    logger.errorBox(
      'Config Error',
      `Could not transform configuration: ${error}`
    );
    throw error;
  }

  const cleanup = () => {
    if (tempConfigPath && existsSync(tempConfigPath)) {
      try {
        unlinkSync(tempConfigPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  };

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['react-scanner', '--config', finalConfigPath], {
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
      cleanup();
      logger.spinnerError('Scan cancelled');
      process.exit(1);
    };

    process.on('SIGINT', handleSignal);
    process.on('SIGTERM', handleSignal);

    child.on('close', code => {
      // Remove signal handlers
      process.off('SIGINT', handleSignal);
      process.off('SIGTERM', handleSignal);
      cleanup();

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
      cleanup();

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
