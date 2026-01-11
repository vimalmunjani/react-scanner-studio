import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { createInterface } from 'readline';
import { createRequire } from 'module';
import * as logger from './logger.js';

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
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    logger.warning('react-scanner is required but not installed.');
    rl.question(`  Would you like to install it now? (Y/n): `, answer => {
      rl.close();
      resolve(
        answer.toLowerCase() === 'y' ||
          answer.toLowerCase() === 'yes' ||
          answer === ''
      );
    });
  });
}

export function installReactScanner(): void {
  logger.startSpinner('Installing react-scanner...');
  try {
    const useYarn = existsSync('yarn.lock');
    let isWorkspace = false;

    if (existsSync('package.json')) {
      const packageContent = readFileSync('package.json', 'utf-8');
      const packageJson = JSON.parse(packageContent);
      if (packageJson.workspaces) {
        isWorkspace = true;
      }
    }

    let command;
    if (useYarn) {
      command = `yarn add react-scanner --dev --ignore-engines${isWorkspace ? ' -W' : ''}`;
    } else {
      command = 'npm install react-scanner --save-dev';
    }

    execSync(command, { stdio: 'pipe' });
    logger.spinnerSuccess('react-scanner installed successfully!');
  } catch {
    logger.spinnerError('Failed to install react-scanner');
    logger.errorBox(
      'Installation Failed',
      'Could not install react-scanner automatically.\nPlease install it manually and try again.'
    );
    process.exit(1);
  }
}
