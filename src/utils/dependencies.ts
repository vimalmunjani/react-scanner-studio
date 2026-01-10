import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

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
    console.error('Error: react-scanner is not installed.');
    console.error('Please install it by running:');
    console.error('  npm install react-scanner');
    console.error('  or');
    console.error('  yarn add react-scanner');
    process.exit(1);
  }
  return true;
}

export async function promptInstallReactScanner(): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('react-scanner is required. Would you like to install it? (y/n): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

export function installReactScanner(): void {
  console.log('Installing react-scanner...');
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

    execSync(command, { stdio: 'inherit' });
    console.log('react-scanner installed successfully!');
  } catch (error) {
    console.error('Failed to install react-scanner. Please install it manually.');
    process.exit(1);
  }
}
