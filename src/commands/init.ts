import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import {
  isReactScannerInstalled,
  promptInstallReactScanner,
  installReactScanner,
  createReactScannerConfig,
  updateIgnoreFiles,
  updatePackageJsonScripts,
  logger,
  inquirerTheme,
} from '../utils/index.js';

export function initCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize react-scanner configuration')
    .action(async () => {
      logger.infoBox(
        'Welcome to React Scanner Studio',
        'Initializing your project...'
      );

      if (!isReactScannerInstalled()) {
        const shouldInstall = await promptInstallReactScanner();
        if (shouldInstall) {
          await installReactScanner();
        } else {
          logger.errorBox(
            'Installation Required',
            'react-scanner is required to continue.\nPlease install it manually and try again.'
          );
          process.exit(1);
        }
      }

      // Prompt for crawlFrom
      logger.info(
        `${logger.bgHighlight('crawlFrom')} The directory where react-scanner will start crawling for React components.`
      );
      logger.dim('This is typically your source folder (e.g., ./src, ./app).');

      const crawlFrom = await input({
        message: 'Enter the path to crawl from:',
        default: './src',
        theme: inquirerTheme,
      });

      // Prompt for importedFrom
      logger.info(
        `${logger.bgHighlight('importedFrom')} The package or path that components are imported from.`
      );
      logger.dim(
        'This filters which components to track (e.g., @mui/material, @chakra-ui/react, ./components).'
      );

      const importedFrom = await input({
        message: 'Enter the import source to track:',
        default: '@mui/material',
        theme: inquirerTheme,
      });

      const configCreated = createReactScannerConfig({
        crawlFrom,
        importedFrom,
      });
      if (configCreated) {
        updateIgnoreFiles();
        updatePackageJsonScripts();
      }

      logger.successBox(
        'Initialization Complete',
        'Your project is now configured for React Scanner Studio.\nRun ' +
          logger.bold('react-scanner-studio start') +
          ' to begin.'
      );
    });
}
