import { resolve } from 'path';
import {
  readScannerConfigSilent,
  getOutputFile,
  getConfigDir,
} from './scannerConfig.js';
import { readCodeownersFromScanFile, CodeownersReport } from './codeowners.js';

/**
 * Read the CodeownersReport embedded in the scan output file.
 * Returns null if no codeowners data is present or scan file not found.
 */
export async function getCodeownersData(): Promise<{
  data: CodeownersReport | null;
  error: string | null;
}> {
  const config = await readScannerConfigSilent();
  if (!config) {
    return { data: null, error: 'Could not read configuration file' };
  }

  const scanFile = getOutputFile(config);
  if (!scanFile) {
    return { data: null, error: 'No raw-report output file configured' };
  }

  const configDir = getConfigDir();
  const baseDir = configDir || process.cwd();
  const absolutePath = resolve(baseDir, scanFile);

  const data = readCodeownersFromScanFile(absolutePath);
  return { data, error: null };
}
