import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import * as logger from './logger.js';

export interface ScannerConfig {
  crawlFrom?: string;
  includeSubComponents?: boolean;
  importedFrom?: string;
  processors?: Array<[string, { outputTo?: string }]>;
}

export interface ScanData {
  [componentName: string]: {
    instances: number;
    props?: Record<string, number>;
  };
}

/**
 * Read and parse the react-scanner.config.js file
 */
export async function readScannerConfig(): Promise<ScannerConfig | null> {
  const configPath = join(process.cwd(), 'react-scanner.config.js');

  if (!existsSync(configPath)) {
    logger.errorBox(
      'Configuration Not Found',
      `${logger.bold('react-scanner.config.js')} not found.\nRun ${logger.bold('react-scanner-ui init')} first to create the configuration.`
    );
    return null;
  }

  try {
    // Use dynamic import for ES modules
    const config = await import(configPath);
    return config.default || config;
  } catch (error) {
    logger.errorBox(
      'Configuration Error',
      `Failed to read react-scanner.config.js\n${error}`
    );
    return null;
  }
}

/**
 * Get the output file path from the scanner config
 */
export function getOutputFile(config: ScannerConfig): string | null {
  if (!config.processors || !Array.isArray(config.processors)) {
    return null;
  }

  for (const processor of config.processors) {
    if (
      Array.isArray(processor) &&
      processor[0] === 'count-components-and-props' &&
      processor[1]?.outputTo
    ) {
      return processor[1].outputTo;
    }
  }

  return null;
}

/**
 * Read and parse the scan data from a JSON file
 */
export function readScanData(filePath: string): ScanData | null {
  const absolutePath = resolve(process.cwd(), filePath);

  if (!existsSync(absolutePath)) {
    logger.errorBox(
      'Scan Data Not Found',
      `Scan data file not found: ${logger.bold(absolutePath)}\n\nRun ${logger.bold('npx react-scanner')} first to generate the scan data.`
    );
    return null;
  }

  try {
    const content = readFileSync(absolutePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    logger.errorBox('Parse Error', `Failed to read scan data: ${error}`);
    return null;
  }
}

/**
 * Get the scan data from the react-scanner output
 */
export async function getScanData(): Promise<{
  data: ScanData | null;
  error: string | null;
}> {
  const config = await readScannerConfig();
  if (!config) {
    return { data: null, error: 'Could not read react-scanner.config.js' };
  }

  const scanFile = getOutputFile(config);
  if (!scanFile) {
    return {
      data: null,
      error:
        'Could not find output file in config. Make sure you have a count-components-and-props processor configured with outputTo.',
    };
  }

  const data = readScanData(scanFile);
  if (!data) {
    return { data: null, error: 'Failed to parse scan data.' };
  }

  return { data, error: null };
}
