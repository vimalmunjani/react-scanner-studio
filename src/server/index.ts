import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getScanData } from '../utils/scannerConfig.js';
import { logger } from '../utils/index.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the path to the UI directory.
 * Works both in development (src/) and production (dist/)
 */
function getUiRoot(): string {
  // __dirname will be either src/server or dist/server
  // UI is always at project-root/ui
  const currentDir = __dirname;

  // Go up from server/ to src/ or dist/, then up to project root, then into ui/
  return resolve(currentDir, '../../ui');
}

/**
 * Start the HTTP server using RSpack dev server
 */
export async function startServer(port: number): Promise<void> {
  logger.startSpinner('Starting development server...');

  const { rspack } = await import('@rspack/core');
  const { RspackDevServer } = await import('@rspack/dev-server');

  const uiRoot = getUiRoot();

  const compiler = rspack({
    context: uiRoot,
    entry: {
      main: './main.tsx',
    },
    output: {
      path: resolve(uiRoot, '../dist/ui'),
      filename: '[name].js',
      cssFilename: '[name].css',
      publicPath: '/',
    },
    stats: 'none',
    infrastructureLogging: {
      level: 'none',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        '@/components': resolve(uiRoot, 'components'),
        '@/lib': resolve(uiRoot, 'components/lib'),
        '@/hooks': resolve(uiRoot, 'components/hooks'),
      },
    },
    experiments: {
      css: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: true,
                    refresh: true,
                  },
                },
              },
            },
          },
          include: [uiRoot],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['@tailwindcss/postcss'],
                },
              },
            },
          ],
          type: 'css/auto',
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico|webp)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new rspack.HtmlRspackPlugin({
        template: './index.html',
        filename: 'index.html',
        inject: true,
      }),
      new rspack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      // React Refresh plugin for HMR
      await import('@rspack/plugin-react-refresh').then(m => new m.default()),
    ],
    devtool: 'cheap-module-source-map',
    mode: 'development',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const devServerOptions: any = {
    port,
    hot: true,
    open: false,
    historyApiFallback: true,
    client: {
      logging: 'none',
      overlay: false,
    },
    static: {
      directory: resolve(uiRoot, 'public'),
      publicPath: '/',
      serveIndex: true,
      watch: true,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setupMiddlewares: (middlewares: any[]) => {
      // Add API routes before other middlewares
      middlewares.unshift({
        name: 'api-scan-data',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        middleware: (req: any, res: any, next: any) => {
          const url = req.url || '';
          if (url === '/api/scan-data' || url.startsWith('/api/scan-data?')) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-cache');
            getScanData().then(result => {
              res.end(JSON.stringify(result));
            });
            return;
          }
          next();
        },
      });
      return middlewares;
    },
  };

  const devServer = new RspackDevServer(devServerOptions, compiler);

  // Handle graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down server...');
    await devServer.stop();
    logger.success('Server stopped gracefully');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return new Promise<void>((resolvePromise, reject) => {
    devServer
      .start()
      .then(() => {
        logger.spinnerSuccess('Server started');
        logger.serverInfo(port, [
          'Hot Module Replacement enabled',
          'Press Ctrl+C to stop the server',
        ]);
        resolvePromise();
      })
      .catch((err: Error) => {
        logger.spinnerError('Server error');
        logger.errorBox('Server Error', err.message);
        reject(err);
      });
  });
}
