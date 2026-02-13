# scan

Scan your codebase for component usage using react-scanner.

## Usage

```bash
react-scanner-studio scan
```

## Description

The `scan` command invokes `react-scanner` as a child process to analyze your codebase and generate a component usage report. This is a convenience wrapper that:

1. Locates your `react-scanner.config.js` file
2. Runs `react-scanner` with the config file path
3. Outputs the scan results to the location specified in your config

## Prerequisites

Before running `scan`, ensure that:

1. **Configuration exists** — Run `react-scanner-studio init` if you haven't already
2. **react-scanner is installed** — The command will exit with an error if not found

## Example

```bash
$ npx react-scanner-studio scan

╭─────────────────────────────────────────────╮
│                                             │
│   React Scanner Studio                      │
│   Scanning your codebase for component      │
│   usage...                                  │
│                                             │
╰─────────────────────────────────────────────╯

◐ Running react-scanner...
✔ Scan completed successfully

╭─────────────────────────────────────────────╮
│                                             │
│   Scan Complete                             │
│                                             │
│   Component usage data has been generated.  │
│                                             │
│   Run react-scanner-studio start to view    │
│   the dashboard or react-scanner-studio     │
│   build to generate static files.           │
│                                             │
╰─────────────────────────────────────────────╯
```

## Config File Resolution

The `scan` command searches for `react-scanner.config.js` starting from the current directory and moving upward through parent directories until it finds the config file. This allows you to run commands from any subdirectory within your project.

For example, if your config is at `/my-project/react-scanner.config.js`, you can run the scan command from `/my-project/src/components/` and it will still find the config.

## Output Location

The scan output is determined by the `outputTo` option in your config file:

```js
// react-scanner.config.js
module.exports = {
  crawlFrom: './src',
  importedFrom: '@mui/material',
  processors: [
    [
      'raw-report',
      {
        outputTo: './.react-scanner-studio/scan-report.json', // Output location
      },
    ],
  ],
};
```

## Workflow

The `scan` command fits into the typical workflow as follows:

```bash
# 1. Initialize configuration (one-time)
react-scanner-studio init

# 2. Scan your codebase
react-scanner-studio scan

# 3. View or build the dashboard
react-scanner-studio start
# or
react-scanner-studio build
```

## Combining with Other Commands

You can combine `scan` with `start` or `build` in your npm scripts:

```json
{
  "scripts": {
    "scan": "react-scanner-studio scan",
    "scan:view": "react-scanner-studio scan && react-scanner-studio start",
    "scan:build": "react-scanner-studio scan && react-scanner-studio build"
  }
}
```

## Error Handling

### Configuration Not Found

```bash
╭─────────────────────────────────────────────╮
│   Configuration Not Found                   │
│                                             │
│   No react-scanner.config.js found.         │
│   Run react-scanner-studio init first to    │
│   create the configuration.                 │
╰─────────────────────────────────────────────╯
```

**Solution:** Run `react-scanner-studio init` to create a configuration file.

### Missing react-scanner

```bash
╭─────────────────────────────────────────────╮
│   Missing Dependency: "react-scanner"       │
│                                             │
│   react-scanner is not installed.           │
│   This package is required to analyze your  │
│   React components.                         │
╰─────────────────────────────────────────────╯
```

**Solution:** Install react-scanner:

```bash
npm install --save-dev react-scanner
```

### Scan Errors

If react-scanner encounters errors during scanning (e.g., syntax errors in your code, invalid config), the error details will be displayed:

```bash
╭─────────────────────────────────────────────╮
│   Scan Error                                │
│                                             │
│   [Error details from react-scanner]        │
╰─────────────────────────────────────────────╯
```

## Comparison with Direct react-scanner Usage

| Feature            | `react-scanner-studio scan` | `npx react-scanner`           |
| ------------------ | --------------------------- | ----------------------------- |
| Auto-finds config  | ✅ Yes                      | ❌ No (uses default location) |
| Styled output      | ✅ Yes                      | ❌ Plain text                 |
| Progress indicator | ✅ Yes                      | ❌ No                         |
| Next steps hint    | ✅ Yes                      | ❌ No                         |

## See Also

- [init](/cli/init) — Initialize configuration
- [start](/cli/start) — Start the development server
- [build](/cli/build) — Build static files for production
- [Configuration](/configuration/) — Configuration options
