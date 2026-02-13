export {
  isReactScannerInstalled,
  checkPeerDependency,
  promptInstallReactScanner,
  installReactScanner,
} from './dependencies.js';
export {
  createReactScannerConfig,
  updateIgnoreFiles,
  updatePackageJsonScripts,
} from './config.js';
export type { ScannerConfigOptions } from './config.js';
export { getServerPort, isPortAvailable } from './port.js';
export type { PortOptions } from './port.js';
export {
  readScannerConfig,
  readScanData,
  getScanData,
} from './scannerConfig.js';
export * as logger from './logger.js';
export { inquirerTheme } from './logger.js';
