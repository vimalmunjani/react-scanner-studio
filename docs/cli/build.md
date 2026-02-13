# build

The `build` command generates a portable, static version of the React Scanner Studio dashboard that can be hosted anywhere or shared with your team.

## Usage

```bash
react-scanner-studio build [options]
```

## Options

| Option | Default | Description                             |
| ------ | ------- | --------------------------------------- |
| `--ci` | `false` | Run in CI mode (no interactive prompts) |

## Description

The `build` command performs the following steps:

1. **Checks for scan report** — Prompts to use existing report or generate a new one
2. **Reads scan data** — Loads the component usage data from your `react-scanner` output
3. **Builds the UI** — Compiles the React dashboard using Vite
4. **Embeds scan data** — Injects the scan data into the static build
5. **Outputs to directory** — Writes all files to `.react-scanner-studio/`

## Scan Report Handling

Before building, the command checks for an existing scan report:

### When a Report Exists

If a scan report is found, you'll be prompted:

```bash
   ℹ Found existing scan report with 42 components (5 minutes ago)
? Use existing report? (No to generate a new one) (Y/n)
```

- **Yes (default)** — Use the existing report for the build
- **No** — Generate a new scan report before building

### When No Report Exists

If no scan report is found, you'll be prompted:

```bash
   ⚠ No scan report found.
? Would you like to generate a scan report now? (Y/n)
```

- **Yes (default)** — Run the scanner and then build
- **No** — Exit without building

### CI Mode Behavior

In CI mode (`--ci`):

- If a report exists, it will be used automatically without prompting
- If no report exists, the command will exit with an error

```bash
# CI mode - uses existing report or fails
react-scanner-studio build --ci
```

::: warning
In CI mode, if no scan report exists, the command will fail. Make sure to run `react-scanner-studio scan` before building in CI mode.
:::

## Output

After running the build command, you'll have a `.react-scanner-studio/` directory containing:

```
.react-scanner-studio/
├── index.html          # Main dashboard page
├── scan-report.json    # Embedded scan data
└── assets/             # Static assets (JS, CSS)
```

## Example

```bash
$ npx react-scanner-studio build

╭─────────────────────────────────────────────╮
│                                             │
│   React Scanner Studio                      │
│   Building static files for production...   │
│                                             │
╰─────────────────────────────────────────────╯

◐ Reading scan data...
✔ Scan data loaded
◐ Building UI with Vite...
✔ UI built successfully
◐ Embedding scan data...
✔ Scan data embedded

╭─────────────────────────────────────────────╮
│                                             │
│   Build Complete!                           │
│                                             │
│   Output: .react-scanner-studio/            │
│                                             │
│   To preview locally, run:                  │
│   npx serve .react-scanner-studio           │
│                                             │
╰─────────────────────────────────────────────╯
```

## Serving the Build

You can serve the built files locally using any static file server:

```bash
# Using serve
npx serve .react-scanner-studio

# Using http-server
npx http-server .react-scanner-studio

# Using Python
python -m http.server --directory .react-scanner-studio 8000
```

## Deployment Options

The static build can be deployed to any static hosting service:

### GitHub Pages

```yaml
# .github/workflows/deploy.yml
- name: Build dashboard
  run: |
    npx react-scanner
    npx react-scanner-studio build

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: .react-scanner-studio
```

### Netlify

```bash
# Build command
npx react-scanner && npx react-scanner-studio build

# Publish directory
.react-scanner-studio
```

### Vercel

```json
{
  "buildCommand": "npx react-scanner && npx react-scanner-studio build",
  "outputDirectory": ".react-scanner-studio"
}
```

### AWS S3

```bash
# Build and upload to S3
npx react-scanner
npx react-scanner-studio build
aws s3 sync .react-scanner-studio s3://your-bucket-name
```

## Prerequisites

Before running `build`, ensure that:

1. **react-scanner.config.js exists** — Run `react-scanner-studio init` if not
2. **react-scanner is installed** — The command will exit with an error if not found

::: tip
You no longer need to manually run `react-scanner-studio scan` before building. The build command will prompt you to generate a report if one doesn't exist.
:::

## Error Handling

### Configuration Not Found

```
╭─────────────────────────────────────────────╮
│   Configuration Not Found                   │
│                                             │
│   react-scanner.config.js not found.        │
│   Run react-scanner-studio init first.      │
╰─────────────────────────────────────────────╯
```

**Solution:** Run `react-scanner-studio init` to create the configuration file.

### Scan Data Not Found

```
╭─────────────────────────────────────────────╮
│   Scan Data Not Found                       │
│                                             │
│   Scan data file not found.                 │
│   Run npx react-scanner first.              │
╰─────────────────────────────────────────────╯
```

**Solution:** Run `npx react-scanner` to generate the scan data.

## Tips

::: tip Automate with npm scripts
Add build scripts to your `package.json` for convenience:

```json
{
  "scripts": {
    "studio:build": "react-scanner-studio build",
    "studio:build:fresh": "react-scanner-studio scan && react-scanner-studio build --ci"
  }
}
```

The first script will prompt you interactively, while the second always generates a fresh report.
:::

::: tip Version control
The `.react-scanner-studio/` directory is automatically added to `.gitignore` during init. If you want to commit the built files, remove the entry from `.gitignore`.
:::

## See Also

- [init](/cli/init) — Initialize configuration
- [start](/cli/start) — Start the development server
- [CI/CD Integration](/advanced/ci-cd/) — Automate builds in your pipeline
