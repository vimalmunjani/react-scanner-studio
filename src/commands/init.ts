import { Command } from 'commander';
import {
  isReactScannerInstalled,
  promptInstallReactScanner,
  installReactScanner,
  createReactScannerConfig,
  logger,
} from '../utils/index.js';

export function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize react-scanner configuration')
    .action(async () => {
      logger.infoBox('React Scanner UI', 'Initializing your project...');

      if (!isReactScannerInstalled()) {
        const shouldInstall = await promptInstallReactScanner();
        if (shouldInstall) {
          installReactScanner();
        } else {
          logger.errorBox(
            'Installation Required',
            'react-scanner is required to continue.\nPlease install it manually and try again.'
          );
          process.exit(1);
        }
      }
      createReactScannerConfig();
      logger.successBox(
        'Initialization Complete',
        'Your project is now configured for React Scanner UI.\nRun ' +
          logger.bold('react-scanner-ui start') +
          ' to begin.'
      );
    });
}
