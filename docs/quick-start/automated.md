# Automated Setup

The quickest way to get started with React Scanner Studio using the interactive CLI.

## Prerequisites

- Node.js 18 or higher
- A React project with components to analyze

## Step 1: Initialize Configuration

Navigate to your React project directory and run:

```bash
npx react-scanner-studio init
```

This command will:

1. **Check for react-scanner** — If not installed, it will offer to install it for you
2. **Prompt for configuration** — You'll be asked two questions:
   - `crawlFrom`: The directory to scan (default: `./src`)
   - `importedFrom`: The package to track components from (e.g., `@mui/material`, `@chakra-ui/react`)
3. **Create config file** — Generates a `react-scanner.config.js` in your current directory
4. **Update ignore files** — Adds `.react-scanner-studio/` to your `.gitignore`, `.eslintignore`, and `.prettierignore`
5. **Add npm scripts** — Adds `scan`, `scan:start`, and `scan:build` scripts to your `package.json`

### Example Initialization

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

## Step 2: Start the Dashboard

Start the interactive dashboard:

```bash
npm run scan:start
# or
npx react-scanner-studio start
```

Since this is your first time, you'll be prompted to generate a scan report:

```bash
   ⚠ No scan report found.
? Would you like to generate a scan report now? (Y/n)
```

Press **Enter** (or type `Y`) to scan your codebase and start the dashboard.

## Step 3: View Your Dashboard

The development server will start and automatically open your browser to `http://localhost:3000`.

```bash
╭──────────────────────────────────────────────────╮
│                                                  │
│   🚀 React Scanner Studio: Server Running        │
│                                                  │
│   Local:    http://localhost:3000                │
│                                                  │
│   Press Ctrl+C to stop the server                │
│                                                  │
╰──────────────────────────────────────────────────╯
```

## Step 4: Build for Sharing (Optional)

To generate a portable, static version of the dashboard:

```bash
npm run scan:build
# or
npx react-scanner-studio build
```

This creates a `.react-scanner-studio/` directory containing:

- `index.html` — The main dashboard page
- `scan-report.json` — The embedded scan data
- Static assets (JS, CSS)

You can serve this directory with any static file server:

```bash
npx serve .react-scanner-studio
```

Or deploy it to GitHub Pages, Netlify, Vercel, or any other static hosting service.

## What's Next?

- [CLI Commands](/cli/) — Learn about all available commands and options
- [Configuration](/configuration/) — Customize your react-scanner configuration
- [CI/CD Integration](/advanced/ci-cd/) — Automate scanning in your pipeline
