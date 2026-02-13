import { Command } from 'commander';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { confirm } from '@inquirer/prompts';
import { checkPeerDependency } from '../utils/dependencies.js';
import {
  getScanData,
  readScannerConfig,
  getOutputFile,
  checkScanReport,
  formatRelativeTime,
  getConfigDir,
} from '../utils/scannerConfig.js';
import { logger, inquirerTheme } from '../utils/index.js';
import { runScan, getConfigPath } from './scan.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the path to the UI directory.
 * Works both in development (src/) and production (dist/)
 */
function getUiRoot(): string {
  // __dirname will be either src/commands or dist/commands
  // UI is always at project-root/ui
  const currentDir = __dirname;

  // Go up from commands/ to src/ or dist/, then up to project root, then into ui/
  return resolve(currentDir, '../../ui');
}

/**
 * Check for existing scan report and prompt user accordingly
 * Returns true if we should proceed, false if user cancelled
 */
async function handleScanReport(ciMode: boolean): Promise<boolean> {
  // First check if config exists
  const configPath = getConfigPath();
  if (!configPath) {
    logger.errorBox(
      'Configuration Not Found',
      `No ${logger.bold('react-scanner.config.js')} found.\nRun ${logger.bold('react-scanner-studio init')} first to create the configuration.`
    );
    return false;
  }

  const reportInfo = await checkScanReport();

  if (reportInfo.exists && reportInfo.modifiedAt) {
    // Report exists - ask user if they want to use it or generate a new one
    const relativeTime = formatRelativeTime(reportInfo.modifiedAt);
    const componentInfo =
      reportInfo.componentCount !== null
        ? ` with ${logger.bold(String(reportInfo.componentCount))} components`
        : '';

    logger.info(
      `Found existing scan report${componentInfo} (${logger.bold(relativeTime)})`
    );

    if (ciMode) {
      // In CI mode, use existing report without prompting
      logger.info('Using existing report (CI mode)');
      return true;
    }

    const generateNew = await confirm({
      message: 'Generate a new report?',
      default: false,
      theme: inquirerTheme,
    });

    if (!generateNew) {
      return true;
    }

    // User wants a new report - run the scan
    try {
      await runScan({ showIntro: false, showSuccessBox: false });
      return true;
    } catch {
      return false;
    }
  } else {
    // No report exists - ask user if they want to generate one
    logger.warning('No scan report found.');

    if (ciMode) {
      // In CI mode, fail if no report exists
      logger.errorBox(
        'Scan Report Not Found',
        `No scan report found. Run ${logger.bold('react-scanner-studio scan')} first to generate the scan data.`
      );
      return false;
    }

    const shouldGenerate = await confirm({
      message: 'Would you like to generate a scan report now?',
      default: true,
      theme: inquirerTheme,
    });

    if (!shouldGenerate) {
      logger.info('Cannot build without a scan report. Exiting.');
      return false;
    }

    // Run the scan
    try {
      await runScan({ showIntro: true, showSuccessBox: false });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Build the React Scanner Studio and output to consumer's .react-scanner-studio/ folder
 */
async function runBuild(): Promise<void> {
  const configDir = getConfigDir();
  const projectRoot = configDir || process.cwd();
  const outputDir = resolve(projectRoot, '.react-scanner-studio');

  logger.infoBox(
    'React Scanner Studio',
    'Building static files for production...'
  );

  // Step 1: Get the scan data
  logger.startSpinner('Reading scan data...');
  const scanResult = await getScanData();

  if (scanResult.error) {
    logger.spinnerError('Failed to read scan data');
    logger.errorBox('Error', scanResult.error);
    process.exit(1);
  }

  if (!scanResult.data) {
    logger.spinnerError('Failed to read scan data');
    logger.errorBox('Error', 'No scan data found.');
    process.exit(1);
  }

  logger.spinnerSuccess('Scan data loaded');

  // Step 2: Build the UI with Vite
  logger.startSpinner('Building UI with Vite...');

  const { build } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;
  const tailwindcss = (await import('@tailwindcss/vite')).default;

  const uiRoot = getUiRoot();

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Get the scan data file name from config
  const config = await readScannerConfig();
  const scanFile = config ? getOutputFile(config) : null;
  const scanFileName = scanFile ? basename(scanFile) : 'scan-data.json';

  try {
    await build({
      root: uiRoot,
      plugins: [react(), tailwindcss()],
      base: './', // Use relative paths for assets
      build: {
        outDir: outputDir,
        emptyOutDir: true,
      },
      resolve: {
        alias: {
          '@/components': resolve(uiRoot, 'components'),
          '@/lib': resolve(uiRoot, 'components/lib'),
          '@/hooks': resolve(uiRoot, 'components/hooks'),
        },
      },
      logLevel: 'warn', // Reduce noise during build
    });
  } catch (error) {
    logger.spinnerError('Vite build failed');
    logger.errorBox('Build Error', String(error));
    process.exit(1);
  }

  logger.spinnerSuccess('UI built successfully');

  // Step 3: Write the scan data as a JSON file (using same filename from config)
  logger.startSpinner('Embedding scan data...');
  const scanDataPath = resolve(outputDir, scanFileName);
  writeFileSync(
    scanDataPath,
    JSON.stringify({ data: scanResult.data, error: null }, null, 2)
  );

  // Step 4: Create a custom index.html that loads scan data from the JSON file
  // We need to modify the built index.html to handle static data loading
  const indexPath = resolve(outputDir, 'index.html');
  const { readFileSync } = await import('fs');
  let indexHtml = readFileSync(indexPath, 'utf-8');

  // Inject a script that intercepts fetch calls to /api/scan-data
  const injectScript = `
    <script>
      // Intercept fetch for static build
      const originalFetch = window.fetch;
      window.fetch = async function(url, options) {
        if (url === '/api/scan-data' || url.endsWith('/api/scan-data')) {
          const response = await originalFetch('./${scanFileName}', options);
          return response;
        }
        return originalFetch(url, options);
      };
    </script>
  `;

  // Inject the script before the closing </head> tag
  indexHtml = indexHtml.replace('</head>', `${injectScript}</head>`);
  writeFileSync(indexPath, indexHtml);

  logger.spinnerSuccess('Scan data embedded');

  // Display build complete message
  logger.buildComplete(outputDir, [`npx serve ${outputDir}`]);
}

export function buildCommand(program: Command): void {
  program
    .command('build')
    .description(
      'Build the React Scanner Studio as static files to .react-scanner-studio/'
    )
    .option('--ci', 'Run in CI mode (no interactive prompts)', false)
    .action(async options => {
      checkPeerDependency();

      // Check for scan report and handle accordingly
      const shouldProceed = await handleScanReport(options.ci);
      if (!shouldProceed) {
        process.exit(1);
      }

      await runBuild();
    });
}
