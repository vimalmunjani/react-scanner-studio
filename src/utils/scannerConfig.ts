import { existsSync, readFileSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { createRequire } from 'module';
import * as logger from './logger.js';

const require = createRequire(import.meta.url);

export interface ScannerConfig {
  crawlFrom?: string;
  includeSubComponents?: boolean;
  importedFrom?: string;
  processors?: Array<[string, { outputTo?: string }]>;
}

export interface ComponentInstance {
  props: Record<string, string | number | boolean | null>;
  propsSpread: boolean;
  location: {
    file: string;
    start: {
      line: number;
      column: number;
    };
  };
}

export interface ScanData {
  [componentName: string]: {
    instances: ComponentInstance[];
  };
}

const CONFIG_FILE_NAME = 'react-scanner.config';
const SUPPORTED_EXTENSIONS = ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'];

/**
 * Find the react-scanner.config.* file by searching upward from cwd
 */
export function findConfigPath(): string | null {
  let dir = process.cwd();

  while (true) {
    for (const ext of SUPPORTED_EXTENSIONS) {
      const configPath = join(dir, `${CONFIG_FILE_NAME}${ext}`);
      if (existsSync(configPath)) {
        return configPath;
      }
    }

    const parentDir = dirname(dir);

    // Reached the root directory
    if (parentDir === dir) {
      return null;
    }

    dir = parentDir;
  }
}

/**
 * Get the directory containing the react-scanner.config.* file
 */
export function getConfigDir(): string | null {
  const configPath = findConfigPath();
  if (!configPath) {
    return null;
  }
  return dirname(configPath);
}

/**
 * Load the scanner configuration using jiti
 */
async function loadConfig(configPath: string): Promise<ScannerConfig | null> {
  try {
    const { createJiti } = require('jiti');
    const jiti = createJiti(import.meta.url);
    const config = await jiti.import(configPath);
    return config.default || config;
  } catch (error) {
    // Fallback to dynamic import if jiti fails or is not available
    try {
      const config = await import(configPath);
      return config.default || config;
    } catch (innerError) {
      throw new Error(`Failed to load config: ${error}\n${innerError}`);
    }
  }
}

/**
 * Read and parse the react-scanner.config.* file
 */
export async function readScannerConfig(): Promise<ScannerConfig | null> {
  const configPath = findConfigPath();

  if (!configPath) {
    logger.errorBox(
      'Configuration Not Found',
      `${logger.bold(`${CONFIG_FILE_NAME}.*`)} not found.\nRun ${logger.bold('react-scanner-studio init')} first to create the configuration.`
    );
    return null;
  }

  try {
    return await loadConfig(configPath);
  } catch (error) {
    logger.errorBox(
      'Configuration Error',
      `Failed to read configuration file at ${configPath}\n${error}`
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
      processor[0] === 'raw-report' &&
      processor[1]?.outputTo
    ) {
      return processor[1].outputTo;
    }
  }

  return null;
}

/**
 * Check if the parsed data is in wrapped format { data, error }
 */
function isWrappedFormat(
  parsed: unknown
): parsed is { data: ScanData | null; error: string | null } {
  return (
    typeof parsed === 'object' &&
    parsed !== null &&
    'data' in parsed &&
    'error' in parsed
  );
}

/**
 * Read and parse the scan data from a JSON file
 * Handles both raw format (from react-scanner) and wrapped format (from build)
 */
export function readScanData(filePath: string): ScanData | null {
  const configDir = getConfigDir();
  const baseDir = configDir || process.cwd();
  const absolutePath = resolve(baseDir, filePath);

  if (!existsSync(absolutePath)) {
    logger.errorBox(
      'Scan Data Not Found',
      `Scan data file not found: ${logger.bold(absolutePath)}\n\nRun ${logger.bold('npx react-scanner')} first to generate the scan data.`
    );
    return null;
  }

  try {
    const content = readFileSync(absolutePath, 'utf-8');
    const parsed = JSON.parse(content);

    // Handle wrapped format { data, error } from build command
    if (isWrappedFormat(parsed)) {
      return parsed.data;
    }

    // Handle raw format from react-scanner
    return parsed;
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
    return { data: null, error: 'Could not read configuration file' };
  }

  const scanFile = getOutputFile(config);
  if (!scanFile) {
    return {
      data: null,
      error:
        'Could not find output file in config. Make sure you have a raw-report processor configured with outputTo.',
    };
  }

  const data = readScanData(scanFile);
  if (!data) {
    return { data: null, error: 'Failed to parse scan data.' };
  }

  return { data, error: null };
}

/**
 * Information about an existing scan report
 */
export interface ScanReportInfo {
  exists: boolean;
  path: string | null;
  absolutePath: string | null;
  modifiedAt: Date | null;
  componentCount: number | null;
}

/**
 * Check if a scan report exists and get information about it
 */
export async function checkScanReport(): Promise<ScanReportInfo> {
  const config = await readScannerConfigSilent();

  if (!config) {
    return {
      exists: false,
      path: null,
      absolutePath: null,
      modifiedAt: null,
      componentCount: null,
    };
  }

  const scanFile = getOutputFile(config);
  if (!scanFile) {
    return {
      exists: false,
      path: null,
      absolutePath: null,
      modifiedAt: null,
      componentCount: null,
    };
  }

  const configDir = getConfigDir();
  const baseDir = configDir || process.cwd();
  const absolutePath = resolve(baseDir, scanFile);

  if (!existsSync(absolutePath)) {
    return {
      exists: false,
      path: scanFile,
      absolutePath,
      modifiedAt: null,
      componentCount: null,
    };
  }

  try {
    const stats = statSync(absolutePath);
    const content = readFileSync(absolutePath, 'utf-8');
    const parsed = JSON.parse(content);

    // Handle wrapped format { data, error } from build command
    const data = isWrappedFormat(parsed) ? parsed.data : parsed;
    const componentCount = data ? Object.keys(data).length : 0;

    return {
      exists: true,
      path: scanFile,
      absolutePath,
      modifiedAt: stats.mtime,
      componentCount,
    };
  } catch {
    return {
      exists: false,
      path: scanFile,
      absolutePath,
      modifiedAt: null,
      componentCount: null,
    };
  }
}

/**
 * Read scanner config without showing error messages (for checking purposes)
 */
export async function readScannerConfigSilent(): Promise<ScannerConfig | null> {
  const configPath = findConfigPath();

  if (!configPath) {
    return null;
  }

  try {
    return await loadConfig(configPath);
  } catch {
    return null;
  }
}

/**
 * Format a date as a relative time string (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
