import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export function createReactScannerConfig(): void {
  const configPath = join(process.cwd(), 'react-scanner.config.js');

  if (existsSync(configPath)) {
    console.log('react-scanner.config.js already exists.');
    return;
  }

  const configContent = `module.exports = {
  crawlFrom: './src',
  includeSubComponents: true,
  importedFrom: 'PLACEHOLDER_FOR_IMPORTED_FROM',
  processors: [
    ['raw-report', { outputDir: './.scans' }],
  ],
};
`;

  try {
    writeFileSync(configPath, configContent);
    console.log('Created react-scanner.config.js');
  } catch (error) {
    console.error('Failed to create react-scanner.config.js', error);
  }
}
