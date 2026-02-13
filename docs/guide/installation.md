# Installation

There are several ways to install and use React Scanner Studio depending on your needs.

## Using npx (Recommended)

The quickest way to get started is using `npx`, which runs the package without installing it globally:

```bash
npx react-scanner-studio init
npx react-scanner-studio start
```

This is ideal for:

- Trying out React Scanner Studio
- One-time scans
- CI/CD pipelines

## Global Installation

Install globally to have the `react-scanner-studio` command available anywhere:

::: code-group

```bash [npm]
npm install -g react-scanner-studio
```

```bash [yarn]
yarn global add react-scanner-studio
```

```bash [pnpm]
pnpm add -g react-scanner-studio
```

:::

After global installation, you can run commands directly:

```bash
react-scanner-studio init
react-scanner-studio start
react-scanner-studio build
```

## Project Installation

Install as a dev dependency in your project:

::: code-group

```bash [npm]
npm install --save-dev react-scanner-studio
```

```bash [yarn]
yarn add --dev react-scanner-studio
```

```bash [pnpm]
pnpm add --save-dev react-scanner-studio
```

:::

Then add scripts to your `package.json`:

```json
{
  "scripts": {
    "scan": "react-scanner && react-scanner-studio start",
    "scan:build": "react-scanner && react-scanner-studio build"
  }
}
```

## Peer Dependencies

React Scanner Studio requires `react-scanner` as a peer dependency. If you don't have it installed, the `init` command will offer to install it for you automatically.

To install it manually:

::: code-group

```bash [npm]
npm install --save-dev react-scanner
```

```bash [yarn]
yarn add --dev react-scanner
```

```bash [pnpm]
pnpm add --save-dev react-scanner
```

:::

## Verifying Installation

To verify that React Scanner Studio is installed correctly, run:

```bash
react-scanner-studio --version
```

You should see the version number printed to the console.

## System Requirements

| Requirement     | Version        |
| --------------- | -------------- |
| Node.js         | 18.0 or higher |
| npm             | 8.0 or higher  |
| yarn (optional) | 1.22 or higher |
| pnpm (optional) | 7.0 or higher  |

## What's Next?

Now that you have React Scanner Studio installed, follow the [Quick Start](/quick-start/) guide to set up your first scan.
