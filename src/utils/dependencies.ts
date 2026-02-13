import { existsSync, readFileSync } from 'fs';
import { spawn } from 'child_process';
import { confirm } from '@inquirer/prompts';
import { createRequire } from 'module';
import * as logger from './logger.js';
import { inquirerTheme } from './logger.js';

// ESM equivalent of require.resolve
const require = createRequire(import.meta.url);

export function isReactScannerInstalled(): boolean {
  try {
    require.resolve('react-scanner');
    return true;
  } catch {
    return false;
  }
}

export function checkPeerDependency(): boolean {
  const isLinked = !import.meta.url.includes('node_modules');
  if (isLinked) {
    return true;
  }

  if (!isReactScannerInstalled()) {
    logger.errorBox(
      'Missing Dependency: "react-scanner"',
      'react-scanner is not installed.\nThis package is required to analyze your React components.'
    );
    logger.installInstructions('react-scanner');
    process.exit(1);
  }
  return true;
}

export async function promptInstallReactScanner(): Promise<boolean> {
  logger.warning('react-scanner is required but not installed.');

  const shouldInstall = await confirm({
    message: 'Would you like to install it now?',
    default: true,
    theme: inquirerTheme,
  });

  return shouldInstall;
}

export async function installReactScanner(): Promise<void> {
  const spinner = logger.startSpinner('Installing react-scanner...');

  const useYarn = existsSync('yarn.lock');
  let isWorkspace = false;

  if (existsSync('package.json')) {
    const packageContent = readFileSync('package.json', 'utf-8');
    const packageJson = JSON.parse(packageContent);
    if (packageJson.workspaces) {
      isWorkspace = true;
    }
  }

  let command: string;
  let args: string[];

  if (useYarn) {
    command = 'yarn';
    args = ['add', 'react-scanner', '--dev', '--ignore-engines'];
    if (isWorkspace) {
      args.push('-W');
    }
  } else {
    command = 'npm';
    args = ['install', 'react-scanner', '--save-dev'];
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    let stderr = '';
    let stdout = '';

    child.stdout?.on('data', data => {
      stdout += data.toString();
    });

    child.stderr?.on('data', data => {
      stderr += data.toString();
    });

    // Handle SIGINT (Ctrl+C)
    const handleSignal = () => {
      child.kill('SIGTERM');
      logger.spinnerError('Installation cancelled');
      process.exit(1);
    };

    process.on('SIGINT', handleSignal);
    process.on('SIGTERM', handleSignal);

    child.on('close', code => {
      // Remove signal handlers
      process.off('SIGINT', handleSignal);
      process.off('SIGTERM', handleSignal);

      if (code === 0) {
        logger.spinnerSuccess('react-scanner installed successfully!');
        resolve();
      } else {
        logger.spinnerError('Failed to install react-scanner');
        const errorDetails = stderr || stdout || `Exit code: ${code}`;
        logger.errorBox(
          'Installation Failed',
          `Could not install react-scanner automatically.\n\n${errorDetails}\n\nPlease install it manually and try again.`
        );
        reject(new Error(`Installation failed with code ${code}`));
      }
    });

    child.on('error', err => {
      // Remove signal handlers
      process.off('SIGINT', handleSignal);
      process.off('SIGTERM', handleSignal);

      spinner.fail('Failed to install react-scanner');
      logger.errorBox(
        'Installation Failed',
        `Could not install react-scanner automatically.\n${err.message}\nPlease install it manually and try again.`
      );
      reject(err);
    });
  });
}
