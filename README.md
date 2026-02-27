# React Scanner Studio

**A portable, interactive dashboard for analyzing React component usage across your codebase.**

React Scanner Studio helps you track design system adoption, discover unused components, and analyze prop usage patterns by generating a beautiful, shareable local dashboard.

<div align="center">
  <img src="./logo.png" alt="React Scanner Studio Logo" width="150" height="150">
  <h3>React Scanner Studio</h3>

  [![npm version](https://img.shields.io/npm/v/react-scanner-studio.svg)](https://www.npmjs.com/package/react-scanner-studio)
  [![GitHub stars](https://img.shields.io/github/stars/vimalmunjani/react-scanner-studio?style=social)](https://github.com/vimalmunjani/react-scanner-studio/stargazers)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

## ✨ Features

- 🔍 **React Component Scanning** — Leverages powerful AST parsing (`react-scanner`) to accurately analyze React component usage across your entire frontend codebase
- 📊 **Component Analytics Dashboard** — A beautiful, interactive UI for exploring component statistics, discovering prop usage patterns, and identifying unused components
- 📦 **Portable Static Build** — Generate static HTML reports that can be hosted anywhere (GitHub Pages, Vercel, Netlify) or shared with your team—no server required
- ⚡ **Zero Config Setup** — Get started in seconds with the `init` command that automatically configures everything for Next.js, Vite, or Create React App projects
- 🎨 **Design System Observability** — Perfect for tracking design system component adoption, evaluating UI consistency, and planning migrations
- 🔧 **CI/CD Ready** — Built-in CI mode for seamless integration with GitHub Actions and other continuous integration pipelines to generate automated usage metrics

## 📖 Documentation

Visit our documentation site for detailed usage guides and API reference:

👉 **[https://reactscanner.studio](https://reactscanner.studio)**

## 🎬 Live Demo

See React Scanner Studio in action:

👉 **[https://demo.reactscanner.studio](https://demo.reactscanner.studio)**

## 📸 Screenshots

<details>
<summary><strong>Dark Mode</strong></summary>

### Dashboard Overview
![Dashboard Dark](https://reactscanner.studio/screenshots/dashboard-dark.png)

### Component Inventory
![Component Inventory Dark](https://reactscanner.studio/screenshots/component-inventory-dark.png)

### Component Overview
![Component Overview Dark](https://reactscanner.studio/screenshots/component-overview-dark.png)

### Component Prop Insights
![Component Prop Insight Dark](https://reactscanner.studio/screenshots/component-prop-insight-dark.png)

### Component File Location
![Component File Location Dark](https://reactscanner.studio/screenshots/component-file-location-dark.png)

</details>

<details>
<summary><strong>Light Mode</strong></summary>

### Dashboard Overview
![Dashboard Light](https://reactscanner.studio/screenshots/dashboard-light.png)

### Component Inventory
![Component Inventory Light](https://reactscanner.studio/screenshots/component-inventory-light.png)

### Component Overview
![Component Overview Light](https://reactscanner.studio/screenshots/component-overview-light.png)

### Component Prop Insights
![Component Prop Insight Light](https://reactscanner.studio/screenshots/component-prop-insight-light.png)

### Component File Location
![Component File Location Light](https://reactscanner.studio/screenshots/component-file-location-light.png)

</details>

## 🚀 Quick Start

### Installation

```bash
# Using npx (no installation required)
npx react-scanner-studio init

# Or install globally
npm install -g react-scanner-studio

# Or add as a dev dependency
npm install --save-dev react-scanner-studio
```

### Usage

```bash
# 1. Initialize configuration (one-time setup)
npx react-scanner-studio init

# 2. Start the interactive dashboard
npx react-scanner-studio start

# 3. Build static files for sharing (optional)
npx react-scanner-studio build
```

That's it! The `start` command will automatically prompt you to scan your codebase if no scan report exists.

## 📋 CLI Commands

| Command | Description |
| ------- | ----------- |
| `init`  | Initialize react-scanner configuration in your project |
| `scan`  | Scan your codebase for component usage |
| `start` | Start the interactive dashboard development server |
| `build` | Build a portable, static version of the dashboard |

### Options

```bash
# Start on a custom port
react-scanner-studio start --port 8080

# Auto-open browser
react-scanner-studio start --open

# CI mode (no interactive prompts)
react-scanner-studio start --ci
react-scanner-studio build --ci
```

## 🎯 Use Cases

- **Design System Observability & Adoption** — Track how your React design system components are being utilized across different teams and repositories.
- **Frontend Codebase Analytics** — Understand which React components are most popular, which are underutilized, and identify candidates for deprecation.
- **Prop Pattern Analysis** — Discover common prop combinations, hardcoded values, and usage patterns to optimize component APIs.
- **Safe Refactoring & Migration Planning** — Identify all locations a component is used before modifying its API, deprecating it, or migrating to a new library (e.g., from MUI to Tailwind).
- **Automated Documentation** — Generate shareable component usage reports for stakeholders and design teams.

## 🔧 Configuration

After running `init`, a `react-scanner.config.js` file is created in your project (support for `.ts`, `.mjs`, etc., is also available):

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

### Supported Component Libraries

Works with any component library or custom components:

- Material UI (`@mui/material`)
- Chakra UI (`@chakra-ui/react`)
- Ant Design (`antd`)
- Your custom design system (`@myorg/design-system`)
- Local components (`./components`)

## 📦 Deployment

Build static files and deploy anywhere:

```bash
# Build the dashboard
npx react-scanner-studio build

# Serve locally
npx serve .react-scanner-studio

# Or deploy to GitHub Pages, Netlify, Vercel, etc.
```

## 🤝 Community

- ⭐ [Star on GitHub](https://github.com/vimalmunjani/react-scanner-studio)
- 💬 [Join Discussions](https://github.com/vimalmunjani/react-scanner-studio/discussions)
- 🎮 [Join Discord](https://discord.gg/PU5xrNVd)
- 🐛 [Report Issues](https://github.com/vimalmunjani/react-scanner-studio/issues)

## 📄 License

MIT © [Vimal Munjani](https://github.com/vimalmunjani)
