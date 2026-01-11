import { Command } from 'commander';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { checkPeerDependency } from '../utils/dependencies.js';
import { getScanData } from '../utils/scannerConfig.js';

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
 * Build the React Scanner UI and output to consumer's .react-scanner-ui/ folder
 */
async function runBuild(): Promise<void> {
  const consumerRoot = process.cwd();
  const outputDir = resolve(consumerRoot, '.react-scanner-ui');

  console.log('\n📦 Building React Scanner UI...\n');

  // Step 1: Get the scan data
  console.log('   ➜  Reading scan data...');
  const scanResult = await getScanData();

  if (scanResult.error) {
    console.error(`\n❌ Error: ${scanResult.error}`);
    process.exit(1);
  }

  if (!scanResult.data) {
    console.error('\n❌ Error: No scan data found.');
    process.exit(1);
  }

  // Step 2: Build the UI with Vite
  console.log('   ➜  Building UI with Vite...');

  const { build } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;

  const uiRoot = getUiRoot();

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  try {
    await build({
      root: uiRoot,
      plugins: [react()],
      base: './', // Use relative paths for assets
      build: {
        outDir: outputDir,
        emptyOutDir: true,
      },
      resolve: {
        alias: {
          '@': resolve(uiRoot, 'src'),
        },
      },
      logLevel: 'warn', // Reduce noise during build
    });
  } catch (error) {
    console.error('\n❌ Vite build failed:', error);
    process.exit(1);
  }

  // Step 3: Write the scan data as a JSON file
  console.log('   ➜  Embedding scan data...');
  const scanDataPath = resolve(outputDir, 'scan-data.json');
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
          const response = await originalFetch('./scan-data.json', options);
          return response;
        }
        return originalFetch(url, options);
      };
    </script>
  `;

  // Inject the script before the closing </head> tag
  indexHtml = indexHtml.replace('</head>', `${injectScript}</head>`);
  writeFileSync(indexPath, indexHtml);

  console.log(`\n✅ Build complete! Output: ${outputDir}\n`);
  console.log('   You can serve the static files with any web server:');
  console.log(`   ➜  npx serve ${outputDir}`);
  console.log(`   ➜  python -m http.server -d ${outputDir}`);
  console.log('');
}

export function buildCommand(program: Command): void {
  program
    .command('build')
    .description(
      'Build the React Scanner UI as static files to .react-scanner-ui/'
    )
    .action(async () => {
      checkPeerDependency();
      await runBuild();
    });
}
