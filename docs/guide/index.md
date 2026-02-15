---
description: React Scanner Studio turns react-scanner JSON output into an interactive dashboard for component usage, prop analysis, and design system tracking.
---

# What is React Scanner Studio?

React Scanner Studio is a portable, interactive dashboard for analyzing React component usage across your codebase. It leverages [react-scanner](https://github.com/moroshko/react-scanner) under the hood to scan your component data.

👉 **[View Screenshots](/guide/screenshots)** | **[Live Demo](https://demo.reactscanner.studio)**

## The Problem

When working with large React codebases or design systems, you often need to answer questions like:

- Which components are most frequently used?
- What props are commonly passed to a component?
- Is our design system being adopted consistently?
- Which components might be candidates for deprecation?

While `react-scanner` provides powerful scanning capabilities and outputs detailed JSON data, interpreting that raw data can be tedious and time-consuming.

## The Solution

React Scanner Studio takes the JSON output from `react-scanner` and transforms it into a beautiful, interactive dashboard that makes it easy to:

- **Visualize component usage** — See at a glance which components are used most frequently
- **Analyze prop patterns** — Understand how components are being configured
- **Share insights** — Generate static HTML files that can be shared with anyone
- **Track adoption** — Monitor design system adoption across your codebase

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Your React     │────▶│  react-scanner  │────▶│  React Scanner  │
│  Codebase       │     │  (JSON output)  │     │  Studio (UI)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **Initialize** — The `init` command creates a configuration file tailored to your project
2. **Scan** — The `scan` command (or automatic prompts) analyzes your codebase and generates a JSON report
3. **Visualize** — React Scanner Studio reads the report and displays an interactive dashboard
4. **Share** — Build static files to host anywhere or share with your team

## Key Features

### 🔍 Automatic Configuration

The `init` command automatically creates a `react-scanner.config.js` file tailored to your project, so you can start scanning immediately.

### 📡 Integrated Scanning

The `scan` command wraps `react-scanner` with a beautiful CLI experience, automatically finding your config file and providing helpful output.

### 🚀 Development Server

The `start` command launches a local development server with hot reloading, perfect for exploring your component data during development.

### 📦 Static Build

The `build` command generates a portable, self-contained dashboard that can be:

- Hosted on GitHub Pages, Netlify, Vercel, or any static file server
- Shared via email or internal file sharing
- Archived for historical comparison

### 🔧 CI/CD Integration

Built-in support for continuous integration environments with the `--ci` flag, making it easy to generate reports as part of your build pipeline.

## Prerequisites

React Scanner Studio requires:

- **Node.js** 18.0 or higher
- **react-scanner** (automatically installed during `init` if not present)

## Future Plans

React Scanner Studio currently leverages [react-scanner](https://github.com/moroshko/react-scanner) for codebase analysis. We are developing our own scanning engine that will introduce additional capabilities:

- **Deeper component analysis** — Enhanced detection of component relationships, patterns, and hierarchies
- **Performance insights** — Identification of potential performance bottlenecks in component usage
- **Smarter prop intelligence** — More sophisticated prop pattern recognition and recommendations
- **Framework-aware scanning** — Optimized support for Next.js, Remix, and other React frameworks
- **Incremental scanning** — Faster scans by only analyzing changed files

React Scanner Studio will continue to support `react-scanner` for those who prefer it. The new engine will be an optional upgrade.

Follow our [GitHub repository](https://github.com/vimalmunjani/react-scanner-studio) or join our [Discord community](https://discord.gg/PU5xrNVd) for updates.

## What's Next?

- [Installation Guide](/guide/installation) — Install React Scanner Studio
- [Quick Start](/quick-start/) — Get up and running in 2 minutes
- [CLI Commands](/cli/) — Explore all available commands
