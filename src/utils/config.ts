import { writeFileSync, existsSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import * as logger from './logger.js';
import { findConfigPath } from './scannerConfig.js';

const IGNORE_ENTRY = '.react-scanner-studio/';

const PACKAGE_JSON_SCRIPTS = {
  scan: 'react-scanner-studio scan',
  'scan:start': 'react-scanner-studio start',
  'scan:build': 'react-scanner-studio build',
} as const;
const IGNORE_COMMENT = '# React Scanner Studio';

interface IgnoreFileConfig {
  filename: string;
  displayName: string;
}

const IGNORE_FILES: IgnoreFileConfig[] = [
  { filename: '.gitignore', displayName: '.gitignore' },
  { filename: '.eslintignore', displayName: '.eslintignore' },
  { filename: '.prettierignore', displayName: '.prettierignore' },
];

/**
 * Check if an ignore file already contains the react-scanner-studio entry
 */
function hasIgnoreEntry(filePath: string): boolean {
  if (!existsSync(filePath)) {
    return false;
  }

  const content = readFileSync(filePath, 'utf-8');
  return content.includes(IGNORE_ENTRY);
}

/**
 * Add react-scanner-studio entry to an ignore file
 */
function addIgnoreEntry(filePath: string): boolean {
  try {
    const entryWithComment = `\n${IGNORE_COMMENT}\n${IGNORE_ENTRY}\n`;

    if (!existsSync(filePath)) {
      // Create the file with the entry
      writeFileSync(filePath, `${IGNORE_COMMENT}\n${IGNORE_ENTRY}\n`);
      return true;
    }

    // Append to existing file
    appendFileSync(filePath, entryWithComment);
    return true;
  } catch {
    return false;
  }
}

/**
 * Update all ignore files to exclude .react-scanner-studio/
 */
export function updateIgnoreFiles(): void {
  const cwd = process.cwd();
  const updatedFiles: string[] = [];
  const skippedFiles: string[] = [];
  const failedFiles: string[] = [];

  for (const ignoreFile of IGNORE_FILES) {
    const filePath = join(cwd, ignoreFile.filename);

    if (hasIgnoreEntry(filePath)) {
      skippedFiles.push(ignoreFile.displayName);
      continue;
    }

    if (addIgnoreEntry(filePath)) {
      updatedFiles.push(ignoreFile.displayName);
    } else {
      failedFiles.push(ignoreFile.displayName);
    }
  }

  // Log results
  if (updatedFiles.length > 0) {
    logger.success(
      `Added ${logger.bold(IGNORE_ENTRY)} to: ${updatedFiles.join(', ')}`
    );
  }

  if (skippedFiles.length > 0) {
    logger.dim(`Already configured in: ${skippedFiles.join(', ')}`);
  }

  if (failedFiles.length > 0) {
    logger.warning(`Failed to update: ${failedFiles.join(', ')}`);
  }
}

/**
 * Update package.json to add react-scanner-studio scripts
 */
export function updatePackageJsonScripts(): void {
  const cwd = process.cwd();
  const packageJsonPath = join(cwd, 'package.json');

  if (!existsSync(packageJsonPath)) {
    logger.warning('No package.json found. Skipping script addition.');
    return;
  }

  try {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    const addedScripts: string[] = [];
    const skippedScripts: string[] = [];

    for (const [scriptName, scriptCommand] of Object.entries(
      PACKAGE_JSON_SCRIPTS
    )) {
      if (packageJson.scripts[scriptName]) {
        skippedScripts.push(scriptName);
      } else {
        packageJson.scripts[scriptName] = scriptCommand;
        addedScripts.push(scriptName);
      }
    }

    if (addedScripts.length > 0) {
      writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n'
      );
      logger.success(
        `Added scripts to package.json: ${addedScripts.map(s => logger.bold(s)).join(', ')}`
      );
    }

    if (skippedScripts.length > 0) {
      logger.dim(`Scripts already exist: ${skippedScripts.join(', ')}`);
    }
  } catch (error) {
    logger.warning(`Failed to update package.json: ${error}`);
  }
}

export interface ScannerConfigOptions {
  crawlFrom: string;
  importedFrom: string;
}

export function createReactScannerConfig(
  options: ScannerConfigOptions
): boolean {
  // Check if config already exists in current or parent directories
  const existingConfigPath = findConfigPath();

  if (existingConfigPath) {
    logger.info(
      `react-scanner.config.js already exists at ${existingConfigPath}`
    );
    return false;
  }

  // Create config in current directory
  const configPath = join(process.cwd(), 'react-scanner.config.js');

  const configContent = `module.exports = {
  crawlFrom: '${options.crawlFrom}',
  includeSubComponents: true,
  importedFrom: '${options.importedFrom}',
  processors: [
    ['raw-report', { outputTo: './.react-scanner-studio/scan-report.json' }],
  ],
};
`;

  try {
    writeFileSync(configPath, configContent);
    logger.success('Created react-scanner.config.js');
    return true;
  } catch (error) {
    logger.errorBox(
      'Configuration Error',
      `Failed to create react-scanner.config.js\n${error}`
    );
    return false;
  }
}
