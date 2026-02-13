# Manual Setup

If you prefer to set things up manually or need more control over the configuration, follow these steps.

## Prerequisites

- Node.js 18 or higher
- A React project with components to analyze

## Step 1: Install Dependencies

Install `react-scanner` as a dev dependency:

```bash
# Using npm
npm install --save-dev react-scanner

# Using yarn
yarn add --dev react-scanner

# Using pnpm
pnpm add -D react-scanner
```

## Step 2: Create Configuration File

Create a `react-scanner.config.js` file in your project root:

```js
module.exports = {
  crawlFrom: './src',
  includeSubComponents: true,
  importedFrom: '@mui/material', // Change this to your component library
  processors: [
    ['raw-report', { outputTo: './.react-scanner-studio/scan-report.json' }],
  ],
};
```

### Configuration Options

| Option                 | Description                                | Examples                                                    |
| ---------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `crawlFrom`            | Directory to scan for components           | `./src`, `./app`, `./packages`                              |
| `importedFrom`         | Package or path to track imports from      | `@mui/material`, `@chakra-ui/react`, `antd`, `./components` |
| `includeSubComponents` | Include sub-components like `Button.Group` | `true`, `false`                                             |

### Common Configuration Examples

#### Material UI

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

#### Chakra UI

```js
module.exports = {
  crawlFrom: './src',
  includeSubComponents: true,
  importedFrom: '@chakra-ui/react',
  processors: [
    ['raw-report', { outputTo: './.react-scanner-studio/scan-report.json' }],
  ],
};
```

#### Ant Design

```js
module.exports = {
  crawlFrom: './src',
  includeSubComponents: true,
  importedFrom: 'antd',
  processors: [
    ['raw-report', { outputTo: './.react-scanner-studio/scan-report.json' }],
  ],
};
```

#### Local Components

```js
module.exports = {
  crawlFrom: './src',
  includeSubComponents: true,
  importedFrom: './components',
  processors: [
    ['raw-report', { outputTo: './.react-scanner-studio/scan-report.json' }],
  ],
};
```

#### Next.js App Directory

```js
module.exports = {
  crawlFrom: './app',
  includeSubComponents: true,
  importedFrom: '@/components',
  processors: [
    ['raw-report', { outputTo: './.react-scanner-studio/scan-report.json' }],
  ],
};
```

## Step 3: Update Ignore Files

Add `.react-scanner-studio/` to your `.gitignore`:

```bash
echo "# React Scanner Studio" >> .gitignore
echo ".react-scanner-studio/" >> .gitignore
```

Optionally, add it to `.eslintignore` and `.prettierignore` as well:

```bash
echo ".react-scanner-studio/" >> .eslintignore
echo ".react-scanner-studio/" >> .prettierignore
```

## Step 4: Add Scripts to package.json

Add these scripts to your `package.json` for convenience:

```json
{
  "scripts": {
    "scan": "react-scanner-studio scan",
    "scan:start": "react-scanner-studio start",
    "scan:build": "react-scanner-studio build"
  }
}
```

## Step 5: Run the Scanner

Generate your first scan report:

```bash
npm run scan
# or
npx react-scanner-studio scan
```

## Step 6: Start the Dashboard

Start the interactive dashboard:

```bash
npm run scan:start
# or
npx react-scanner-studio start
```

The development server will start and automatically open your browser to `http://localhost:3000`.

## Step 7: Build for Sharing (Optional)

To generate a portable, static version of the dashboard:

```bash
npm run scan:build
# or
npx react-scanner-studio build
```

This creates a `.react-scanner-studio/` directory that you can deploy to any static hosting service.

## Troubleshooting

### Config errors: crawlFrom path doesn't exist

Make sure the `crawlFrom` path in your config matches your actual source directory:

```js
// Check if your source is in ./src, ./app, or another location
crawlFrom: './src',  // Change this to match your project structure
```

### No components found

Verify that `importedFrom` matches how components are imported in your code:

```js
// If your imports look like this:
import { Button } from '@mui/material';

// Then importedFrom should be:
importedFrom: '@mui/material',
```

## What's Next?

- [CLI Commands](/cli/) — Learn about all available commands and options
- [Configuration](/configuration/) — Customize your react-scanner configuration
- [CI/CD Integration](/advanced/ci-cd/) — Automate scanning in your pipeline
