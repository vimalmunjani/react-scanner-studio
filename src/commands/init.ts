import { Command } from 'commander';
import {
  isReactScannerInstalled,
  promptInstallReactScanner,
  installReactScanner,
  createReactScannerConfig,
} from '../utils';

export function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize react-scanner configuration')
    .action(async () => {
      if (!isReactScannerInstalled()) {
        const shouldInstall = await promptInstallReactScanner();
        if (shouldInstall) {
          installReactScanner();
        } else {
          console.log('react-scanner is required to continue. Exiting.');
          process.exit(1);
        }
      }
      createReactScannerConfig();
      console.log('Initialization complete.');
    });
}
