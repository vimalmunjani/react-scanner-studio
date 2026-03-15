/** @type {import('react-scanner').Config} */
module.exports = {
  crawlFrom: './src',
  includeSubComponents: true,
  importedFrom: /\.\/|\.\.\//, // match local imports
  processors: [
    [
      'raw-report',
      {
        outputTo: '.react-scanner-studio/scan-results.json',
      },
    ],
  ],
};
