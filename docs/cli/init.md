# init

The `init` command initializes React Scanner Studio in your project by creating the necessary configuration file and setting up your environment.

## Usage

```bash
react-scanner-studio init
```

## What It Does

When you run `init`, the command performs the following steps:

### 1. Check for react-scanner

The command first checks if `react-scanner` is installed in your project. If it's not found, you'll be prompted to install it:

```bash
⚠ react-scanner is required but not installed.
? Would you like to install it now? (Y/n)
```

If you choose yes, it will automatically install `react-scanner` using your project's package manager (yarn or npm).

### 2. Prompt for Configuration

You'll be asked to provide two configuration values:

#### crawlFrom

```bash
crawlFrom  The directory where react-scanner will start crawling for React components.
This is typically your source folder (e.g., ./src, ./app).

? Enter the path to crawl from: ./src
```

This specifies where `react-scanner` should look for React components. Common values include:

- `./src` — Standard Create React App structure
- `./app` — Next.js app directory
- `./components` — If your components are in a dedicated folder
- `./packages` — For monorepo setups

#### importedFrom

```bash
importedFrom  The package or path that components are imported from.
This filters which components to track (e.g., @mui/material, @chakra-ui/react, ./components).

? Enter the import source to track: @mui/material
```

This filters which components to track. Only components imported from this source will be counted. Examples:

| Use Case          | Value                                    |
| ----------------- | ---------------------------------------- |
| Material UI       | `@mui/material`                          |
| Chakra UI         | `@chakra-ui/react`                       |
| Ant Design        | `antd`                                   |
| Custom components | `./components` or `@myorg/design-system` |

### 3. Create Configuration File

A `react-scanner.config.js` file is created in your current directory (if one doesn't already exist in the current or any parent directory):

```js
module.exports = {
  crawlFrom: './src',
  includeSubComponents: true,
  importedFrom: '@mui/material',
  processors: [
    ['raw-report', { outputTo: './.react-scanner-studio/scan-report.json' }],
  ],
};
```

### 4. Update Ignore Files

The command automatically adds `.react-scanner-studio/` to your ignore files to prevent the generated output from being committed to version control:

- `.gitignore`
- `.eslintignore`
- `.prettierignore`

```bash
✔ Added .react-scanner-studio/ to: .gitignore, .eslintignore, .prettierignore
```

If any of these files don't exist, they will be created. If the entry already exists, that file will be skipped.

### 5. Add Scripts to package.json

The command adds convenient npm scripts to your `package.json`:

```json
{
  "scripts": {
    "scan": "react-scanner-studio scan",
    "scan:start": "react-scanner-studio start",
    "scan:build": "react-scanner-studio build"
  }
}
```

```bash
✔ Added scripts to package.json: scan, scan:start, scan:build
```

If any of these scripts already exist, they will be skipped to avoid overwriting your custom configurations.

## Example Output

```bash
$ npx react-scanner-studio init

╭─────────────────────────────────────────────╮
│                                             │
│   Welcome to React Scanner Studio           │
│   Initializing your project...              │
│                                             │
╰─────────────────────────────────────────────╯

crawlFrom  The directory where react-scanner will start crawling for React components.
This is typically your source folder (e.g., ./src, ./app).

? Enter the path to crawl from: ./src

importedFrom  The package or path that components are imported from.
This filters which components to track (e.g., @mui/material, @chakra-ui/react, ./components).

? Enter the import source to track: @mui/material

✔ Created react-scanner.config.js
✔ Added .react-scanner-studio/ to: .gitignore, .eslintignore, .prettierignore
✔ Added scripts to package.json: scan, scan:start, scan:build

╭─────────────────────────────────────────────╮
│                                             │
│   Initialization Complete                   │
│   Your project is now configured for        │
│   React Scanner Studio.                     │
│   Run react-scanner-studio start to begin.  │
│                                             │
╰─────────────────────────────────────────────╯
```

## Notes

- If `react-scanner.config.js` already exists, it will not be overwritten
- The command uses interactive prompts and cannot be run non-interactively
- After initialization, you need to run `npx react-scanner` to generate the scan data before using `start` or `build`

## Next Steps

After running `init`:

1. Run `yarn scan` or `npm run scan` to scan your codebase
2. Run `yarn scan:start` or `npm run scan:start` to view the dashboard

## See Also

- [start](/cli/start) — Start the development server
- [build](/cli/build) — Build static files for deployment
- [Configuration](/configuration/) — Learn about configuration options
