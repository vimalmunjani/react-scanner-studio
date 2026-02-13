# Configuration Options

This page documents all the configuration options available in `react-scanner.config.js`.

## Overview

React Scanner Studio uses the standard `react-scanner` configuration file. The `init` command creates a basic configuration, but you can customize it to fit your needs.

## Basic Configuration

```js
// react-scanner.config.js
module.exports = {
  crawlFrom: './src',
  includeSubComponents: true,
  importedFrom: '@mui/material',
  processors: [
    ['raw-report', { outputTo: './.react-scanner-studio/scan-report.json' }],
  ],
};
```

## Options Reference

### crawlFrom

| Type     | Required | Default |
| -------- | -------- | ------- |
| `string` | Yes      | -       |

The directory where react-scanner will start crawling for React components.

```js
// Scan the src directory
crawlFrom: './src';

// Scan the app directory (Next.js)
crawlFrom: './app';

// Scan multiple packages in a monorepo
crawlFrom: './packages';
```

### includeSubComponents

| Type      | Required | Default |
| --------- | -------- | ------- |
| `boolean` | No       | `true`  |

Whether to include sub-components in the scan results. When `true`, components like `Button.Group` or `Card.Header` are counted separately.

```js
// Include sub-components like Menu.Item, Card.Body
includeSubComponents: true;

// Only count top-level components
includeSubComponents: false;
```

### importedFrom

| Type                           | Required | Default |
| ------------------------------ | -------- | ------- |
| `string \| RegExp \| Function` | No       | -       |

Filter which components to track based on their import source. This is useful for tracking design system usage.

#### String

```js
// Track components from Material UI
importedFrom: '@mui/material';

// Track components from a local path
importedFrom: './components';

// Track components from an internal package
importedFrom: '@mycompany/design-system';
```

#### Regular Expression

```js
// Track components from any @mui package
importedFrom: /^@mui\//;

// Track components from multiple sources
importedFrom: /@mui\/material|@mui\/icons-material/;
```

#### Function

```js
// Custom logic for filtering
importedFrom: importInfo => {
  return importInfo.moduleName.startsWith('@mycompany/');
};
```

### processors

| Type    | Required | Default |
| ------- | -------- | ------- |
| `Array` | Yes      | -       |

An array of processors that handle the scan results. React Scanner Studio requires the `raw-report` processor with an `outputTo` option.

```js
processors: [
  [
    'raw-report',
    {
      outputTo: './.react-scanner-studio/scan-report.json',
    },
  ],
];
```

::: warning Important
The `outputTo` path must match what React Scanner Studio expects. By default, this should be `./.react-scanner-studio/scan-report.json`.
:::

### exclude

| Type                      | Required | Default            |
| ------------------------- | -------- | ------------------ |
| `Array<string \| RegExp>` | No       | `['node_modules']` |

Directories or files to exclude from scanning.

```js
exclude: [
  'node_modules',
  '__tests__',
  '*.test.tsx',
  '*.stories.tsx',
  /\.spec\./,
];
```

### globs

| Type            | Required | Default                    |
| --------------- | -------- | -------------------------- |
| `Array<string>` | No       | `['**/*.{js,jsx,ts,tsx}']` |

Glob patterns to match files for scanning.

```js
// Only scan TypeScript files
globs: ['**/*.{ts,tsx}'];

// Scan specific directories
globs: ['src/components/**/*.tsx', 'src/pages/**/*.tsx'];
```

### components

| Type     | Required | Default |
| -------- | -------- | ------- |
| `Object` | No       | -       |

Define custom component tracking rules.

```js
components: {
  // Track specific components
  Button: true,
  Card: true,

  // Ignore specific components
  Icon: false,

  // Custom tracking logic
  Dialog: (props) => {
    return props.open !== undefined;
  },
}
```

## Complete Example

Here's a comprehensive configuration example:

```js
// react-scanner.config.js
module.exports = {
  // Where to start scanning
  crawlFrom: './src',

  // Include sub-components like Button.Group
  includeSubComponents: true,

  // Track Material UI components
  importedFrom: '@mui/material',

  // Exclude test and story files
  exclude: [
    'node_modules',
    '__tests__',
    '**/*.test.{ts,tsx}',
    '**/*.stories.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
  ],

  // Only scan TypeScript files
  globs: ['**/*.{ts,tsx}'],

  // Output configuration
  processors: [
    [
      'raw-report',
      {
        outputTo: './.react-scanner-studio/scan-report.json',
      },
    ],
  ],
};
```

## Multiple Import Sources

To track components from multiple sources, use a regular expression or create multiple configurations:

### Using RegExp

```js
module.exports = {
  crawlFrom: './src',
  importedFrom: /@mui\/material|@emotion\/styled|\.\/components/,
  processors: [
    [
      'raw-report',
      {
        outputTo: './.react-scanner-studio/scan-report.json',
      },
    ],
  ],
};
```

### Multiple Config Files

Create separate configs for different sources:

```js
// react-scanner.mui.config.js
module.exports = {
  crawlFrom: './src',
  importedFrom: '@mui/material',
  processors: [
    [
      'raw-report',
      {
        outputTo: './.react-scanner-studio/mui-report.json',
      },
    ],
  ],
};

// react-scanner.internal.config.js
module.exports = {
  crawlFrom: './src',
  importedFrom: '@mycompany/design-system',
  processors: [
    [
      'raw-report',
      {
        outputTo: './.react-scanner-studio/internal-report.json',
      },
    ],
  ],
};
```

Then run:

```bash
npx react-scanner --config react-scanner.mui.config.js
npx react-scanner --config react-scanner.internal.config.js
```

## Environment-Specific Configuration

Use JavaScript to create environment-specific configurations:

```js
// react-scanner.config.js
const isCI = process.env.CI === 'true';

module.exports = {
  crawlFrom: './src',
  importedFrom: '@mui/material',

  // Include more details in CI
  includeSubComponents: isCI,

  processors: [
    [
      'raw-report',
      {
        outputTo: './.react-scanner-studio/scan-report.json',
      },
    ],
  ],
};
```

## See Also

- [init](/cli/init) — Generate a configuration file
- [react-scanner documentation](https://github.com/moroshko/react-scanner) — Full react-scanner documentation
