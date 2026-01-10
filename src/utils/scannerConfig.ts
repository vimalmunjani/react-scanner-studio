import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

export interface ScannerConfig {
  crawlFrom?: string;
  includeSubComponents?: boolean;
  importedFrom?: string;
  processors?: Array<[string, { outputDir?: string }]>;
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
export function readScannerConfig(): ScannerConfig | null {
  const configPath = join(process.cwd(), 'react-scanner.config.js');

  if (!existsSync(configPath)) {
    console.error('react-scanner.config.js not found. Run `react-scanner-ui init` first.');
    return null;
  }

  try {
    // Clear require cache to get fresh config
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    return config;
  } catch (error) {
    console.error('Failed to read react-scanner.config.js:', error);
    return null;
  }
}

/**
 * Get the output directory from the scanner config
 */
export function getOutputDir(config: ScannerConfig): string | null {
  if (!config.processors || !Array.isArray(config.processors)) {
    return null;
  }

  for (const processor of config.processors) {
    if (Array.isArray(processor) && processor[0] === 'raw-report' && processor[1]?.outputDir) {
      return processor[1].outputDir;
    }
  }

  return null;
}

/**
 * Get the latest scan file from the output directory
 */
export function getLatestScanFile(outputDir: string): string | null {
  const absoluteOutputDir = resolve(process.cwd(), outputDir);

  if (!existsSync(absoluteOutputDir)) {
    console.error(`Scan output directory not found: ${absoluteOutputDir}`);
    console.error('Run react-scanner first to generate scan data.');
    return null;
  }

  try {
    const files = readdirSync(absoluteOutputDir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => ({
        name: file,
        path: join(absoluteOutputDir, file),
        mtime: statSync(join(absoluteOutputDir, file)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (files.length === 0) {
      console.error('No scan files found in output directory.');
      console.error('Run react-scanner first to generate scan data.');
      return null;
    }

    return files[0].path;
  } catch (error) {
    console.error('Failed to read scan output directory:', error);
    return null;
  }
}

/**
 * Read and parse the scan data from a JSON file
 */
export function readScanData(filePath: string): ScanData | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to read scan data:', error);
    return null;
  }
}

/**
 * Get the scan data from the react-scanner output
 */
export function getScanData(): { data: ScanData | null; error: string | null } {
  const config = readScannerConfig();
  if (!config) {
    return { data: null, error: 'Could not read react-scanner.config.js' };
  }

  const outputDir = getOutputDir(config);
  if (!outputDir) {
    return { data: null, error: 'Could not find output directory in config. Make sure you have a raw-report processor configured.' };
  }

  const scanFile = getLatestScanFile(outputDir);
  if (!scanFile) {
    return { data: null, error: 'No scan data found. Run react-scanner first.' };
  }

  const data = readScanData(scanFile);
  if (!data) {
    return { data: null, error: 'Failed to parse scan data.' };
  }

  return { data, error: null };
}
