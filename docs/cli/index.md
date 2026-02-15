---
description: Reference for React Scanner Studio CLI commands — init, scan, start, and build for component usage dashboards.
---

# CLI Commands Overview

React Scanner Studio provides a command-line interface (CLI) for scanning, visualizing, and building component usage dashboards.

## Available Commands

| Command               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| [`init`](/cli/init)   | Initialize react-scanner configuration in your project |
| [`scan`](/cli/scan)   | Scan your codebase for component usage                 |
| [`start`](/cli/start) | Start the interactive dashboard development server     |
| [`build`](/cli/build) | Build a portable, static version of the dashboard      |

## Scan Report Handling

Both `start` and `build` commands automatically check for an existing scan report:

- **If a report exists** — You'll be prompted to use it or generate a new one
- **If no report exists** — You'll be prompted to generate one before proceeding
- **In CI mode (`--ci`)** — Uses existing report automatically, or fails if none exists

## Global Options

These options are available for all commands:

```bash
react-scanner-studio --version    # Display version number
react-scanner-studio --help       # Display help information
react-scanner-studio <command> --help  # Display help for a specific command
```

## Basic Usage

```bash
# Show help
npx react-scanner-studio --help

# Initialize configuration (one-time setup)
npx react-scanner-studio init

# Start the dashboard server (will prompt to scan if needed)
npx react-scanner-studio start

# Build static files (will prompt to scan if needed)
npx react-scanner-studio build

# Manually scan your codebase (optional - start/build handle this automatically)
npx react-scanner-studio scan
```

## Command Flow

The typical workflow follows this order:

```
┌──────────────────┐
│                  │
│   1. init        │  Set up configuration (one-time)
│                  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│                  │
│   2. start       │  View interactive dashboard (development)
│      - or -      │  (automatically prompts to scan if needed)
│   3. build       │  Generate static files (production/sharing)
│                  │
└──────────────────┘
```

::: tip Streamlined Workflow
You don't need to manually run `scan` before `start` or `build`. These commands automatically detect if a scan report exists and prompt you to generate one if it's missing.
:::

## Exit Codes

All commands follow standard exit code conventions:

| Code | Description                                            |
| ---- | ------------------------------------------------------ |
| `0`  | Success                                                |
| `1`  | Error (configuration not found, invalid options, etc.) |

## Environment Detection

React Scanner Studio automatically detects your project environment:

- **Package Manager** — Detects `yarn.lock` to determine whether to use Yarn or npm for installing dependencies
- **Workspaces** — Detects monorepo workspace configurations and adjusts install commands accordingly

## What's Next?

Learn about each command in detail:

- [`init`](/cli/init) — Set up your project
- [`scan`](/cli/scan) — Scan your codebase for component usage
- [`start`](/cli/start) — Run the development server
- [`build`](/cli/build) — Generate static files
