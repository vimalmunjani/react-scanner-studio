import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as logger from './logger.js';

export function createReactScannerConfig(): void {
  const configPath = join(process.cwd(), 'react-scanner.config.js');

  if (existsSync(configPath)) {
    logger.info('react-scanner.config.js already exists.');
    return;
  }

  const configContent = `module.exports = {
  crawlFrom: './src',
  includeSubComponents: true,
  importedFrom: 'PLACEHOLDER_FOR_IMPORTED_FROM',
  processors: [
    ['count-components-and-props', { outputTo: './.react-scanner-ui/scan-report.json' }],
  ],
};
`;

  try {
    writeFileSync(configPath, configContent);
    logger.success('Created react-scanner.config.js');
    logger.info(
      `Tip: Add ${logger.bold('.react-scanner-ui/')} to your .gitignore file.`
    );
  } catch (error) {
    logger.errorBox(
      'Configuration Error',
      `Failed to create react-scanner.config.js\n${error}`
    );
  }
}
