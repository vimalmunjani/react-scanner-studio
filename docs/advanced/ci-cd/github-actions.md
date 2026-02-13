# GitHub Actions

This guide covers how to integrate React Scanner Studio with GitHub Actions for automated component scanning and dashboard deployment.

## Basic Workflow

Generate a component usage report on every push:

```yaml
# .github/workflows/component-scan.yml
name: Component Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Scan codebase
        run: npx react-scanner-studio scan

      - name: Build dashboard
        run: npx react-scanner-studio build

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: component-dashboard
          path: .react-scanner-studio/
```

## Deploy to GitHub Pages

Automatically deploy the dashboard to GitHub Pages:

```yaml
# .github/workflows/deploy-dashboard.yml
name: Deploy Dashboard

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Scan codebase
        run: npx react-scanner-studio scan

      - name: Build dashboard
        run: npx react-scanner-studio build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .react-scanner-studio/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Scheduled Reports

Generate weekly reports for tracking component usage trends:

```yaml
# .github/workflows/weekly-report.yml
name: Weekly Component Report

on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 9 AM UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Scan codebase
        run: npx react-scanner-studio scan

      - name: Build dashboard
        run: npx react-scanner-studio build

      - name: Archive report
        run: |
          DATE=$(date +%Y-%m-%d)
          mkdir -p reports/$DATE
          cp -r .react-scanner-studio/* reports/$DATE/

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: weekly-report-${{ github.run_id }}
          path: reports/
          retention-days: 90
```

## Run Only on Relevant Changes

Optimize your workflow to run only when relevant files change:

```yaml
name: Component Scan

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'
      - 'react-scanner.config.js'
  pull_request:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'
      - 'react-scanner.config.js'
```

## Caching Dependencies

Speed up your workflow by caching dependencies:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

# Or manually cache
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## Add Status Badge

Add a badge to your README to show the workflow status:

```markdown
![Component Scan](https://github.com/your-org/your-repo/actions/workflows/component-scan.yml/badge.svg)
```

## Pull Request Comments

Add scan results as a comment on pull requests:

```yaml
- name: Comment on PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      const fs = require('fs');
      const report = JSON.parse(fs.readFileSync('.react-scanner-studio/scan-report.json', 'utf8'));
      const componentCount = Object.keys(report).length;

      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `## 📊 Component Scan Results\n\nFound **${componentCount}** components in this codebase.`
      });
```

## Complete Example

Here's a complete workflow that combines multiple features:

```yaml
# .github/workflows/component-scan.yml
name: Component Scan

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
      - 'react-scanner.config.js'
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check configuration
        run: |
          if [ ! -f react-scanner.config.js ]; then
            echo "Configuration not found, creating default..."
            npx react-scanner-studio init
          fi

      - name: Scan codebase
        run: npx react-scanner-studio scan

      - name: Build dashboard
        run: npx react-scanner-studio build

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: component-dashboard-${{ github.sha }}
          path: .react-scanner-studio/
          retention-days: 30

  deploy:
    needs: scan
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: component-dashboard-${{ github.sha }}
          path: .react-scanner-studio/

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .react-scanner-studio/

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## See Also

- [CI/CD Overview](/advanced/ci-cd/) — General CI/CD information
- [GitLab CI](/advanced/ci-cd/gitlab-ci) — GitLab CI configuration
- [CircleCI](/advanced/ci-cd/circleci) — CircleCI configuration
- [Azure Pipelines](/advanced/ci-cd/azure-pipelines) — Azure DevOps configuration
