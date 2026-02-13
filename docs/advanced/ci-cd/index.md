# CI/CD Integration

React Scanner Studio is designed to work seamlessly in continuous integration and deployment pipelines. This guide covers how to automate component scanning and dashboard generation.

## Providers

Choose your CI/CD provider to get started:

<div class="ci-providers">

| Provider                                           | Description                       |
| -------------------------------------------------- | --------------------------------- |
| [GitHub Actions](/advanced/ci-cd/github-actions)   | Workflows for GitHub repositories |
| [GitLab CI](/advanced/ci-cd/gitlab-ci)             | Pipeline configuration for GitLab |
| [CircleCI](/advanced/ci-cd/circleci)               | Config for CircleCI pipelines     |
| [Azure Pipelines](/advanced/ci-cd/azure-pipelines) | YAML pipelines for Azure DevOps   |

</div>

## Overview

Integrating React Scanner Studio into your CI/CD pipeline allows you to:

- **Automatically generate reports** on every push or pull request
- **Track component usage over time** by archiving reports
- **Deploy dashboards** to static hosting for team visibility

## CI Mode

The `start` command supports a `--ci` flag that disables interactive prompts:

```bash
react-scanner-studio start --ci --port 3000
```

In CI mode:

- Port conflicts are resolved automatically (uses next available port)
- No interactive prompts are shown
- Output is optimized for log parsing

## General Workflow

Regardless of your CI/CD provider, the general workflow is:

```bash
# 1. Install dependencies
npm ci

# 2. Scan your codebase for component usage
npx react-scanner-studio scan

# 3. Build the static dashboard
npx react-scanner-studio build

# 4. Deploy or archive the .react-scanner-studio/ directory
```

## Best Practices

### 1. Cache Dependencies

Always cache your `node_modules` to speed up builds. See provider-specific guides for syntax.

### 2. Run on Relevant Changes

Only run the scan when relevant files change:

- `src/**` — Source files
- `package.json` — Dependencies
- `react-scanner.config.js` — Scanner configuration

### 3. Archive Historical Data

Store reports over time to track trends:

```bash
DATE=$(date +%Y-%m-%d)
cp .react-scanner-studio/scan-report.json reports/scan-$DATE.json
```

### 4. Add Status Badges

Add a badge to your README showing the last scan status (provider-specific).

## Troubleshooting

### Build fails with "Configuration Not Found"

Ensure `react-scanner.config.js` exists in your repository root:

```bash
if [ ! -f react-scanner.config.js ]; then
  npx react-scanner-studio init
fi
```

### Build fails with "Scan Data Not Found"

Make sure to run `react-scanner` before `react-scanner-studio build`:

```bash
npx react-scanner
npx react-scanner-studio build
```

### Port conflicts in CI

Use the `--ci` flag:

```bash
react-scanner-studio start --ci --port 3000
```

## See Also

- [build](/cli/build) — Build command documentation
- [start](/cli/start) — Start command with CI options
- [Configuration](/configuration/) — Configuration options
