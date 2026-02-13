# LLM-Assisted Setup

Let your AI assistant set up React Scanner Studio based on your project context. Copy the prompt below to Claude, ChatGPT, Cursor, Copilot, or any other AI coding assistant.

## Prerequisites

- Node.js 18 or higher
- A React project with components to analyze
- Access to an AI coding assistant

## The Setup Prompt

Copy and paste the following prompt to your AI assistant:

````markdown
## Task

Set up React Scanner Studio in my project to analyze component usage.

## Instructions

1. Install `react-scanner` as a dev dependency using my package manager

2. Create `react-scanner.config.js` in the project root with:

   ```js
   module.exports = {
     crawlFrom: '<SOURCE_DIRECTORY>',
     includeSubComponents: true,
     importedFrom: '<COMPONENT_LIBRARY>',
     processors: [
       ['raw-report', { outputTo: './.react-scanner-studio/scan-report.json' }],
     ],
   };
   ```

   - Set `crawlFrom` to my source directory (look for `./src`, `./app`, or similar)
   - Set `importedFrom` to match the component library I'm using (check my package.json for libraries like `@mui/material`, `@chakra-ui/react`, `antd`, or use a local path like `./components`)

3. Add `.react-scanner-studio/` to `.gitignore`, `.eslintignore`, and `.prettierignore` (create these files if they don't exist)

4. Add these scripts to my `package.json`:

   ```json
   {
     "scripts": {
       "scan": "react-scanner-studio scan",
       "scan:start": "react-scanner-studio start",
       "scan:build": "react-scanner-studio build"
     }
   }
   ```

5. Tell me what values you chose for `crawlFrom` and `importedFrom` and why

## My Project Context

- Look at my project structure to determine the correct `crawlFrom` path
- Check my `package.json` dependencies to identify which component library I'm using
- If I'm using multiple component libraries, ask me which one to track
````

::: tip Customizing the Prompt
If you already know your source directory or component library, replace `<SOURCE_DIRECTORY>` and `<COMPONENT_LIBRARY>` with specific values to skip the AI's analysis step.
:::

## Example with Known Values

If you already know your configuration values, use this simplified prompt:

````markdown
## Task

Set up React Scanner Studio in my project.

## Instructions

1. Install `react-scanner` as a dev dependency

2. Create `react-scanner.config.js`:

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

3. Add `.react-scanner-studio/` to `.gitignore`

4. Add to `package.json` scripts:
   - `"scan": "react-scanner-studio scan"`
   - `"scan:start": "react-scanner-studio start"`
   - `"scan:build": "react-scanner-studio build"`
````

## After the AI Completes Setup

Once your AI assistant has made the changes, run:

```bash
# Start the dashboard (will prompt to scan if needed)
npm run scan:start

# Or scan first, then start
npm run scan
npm run scan:start
```

## Common Component Libraries

Here are common `importedFrom` values for popular component libraries:

| Library          | `importedFrom` Value             |
| ---------------- | -------------------------------- |
| Material UI      | `@mui/material`                  |
| Chakra UI        | `@chakra-ui/react`               |
| Ant Design       | `antd`                           |
| Radix UI         | `@radix-ui/react-*`              |
| Headless UI      | `@headlessui/react`              |
| shadcn/ui        | `@/components/ui`                |
| Local components | `./components` or `@/components` |

## Troubleshooting

### AI doesn't have access to my files

If your AI assistant can't see your project files, provide context manually:

```markdown
My project structure:

- Source code is in `./src`
- I'm using Material UI (`@mui/material` in package.json)
- Package manager: npm
```

### AI suggests wrong configuration

If the AI's suggestions don't match your project, clarify:

```markdown
Actually, my components are in `./app/components` and I'm using Chakra UI, not Material UI. Please update the configuration.
```

## What's Next?

- [CLI Commands](/cli/) — Learn about all available commands and options
- [Configuration](/configuration/) — Customize your react-scanner configuration
- [CI/CD Integration](/advanced/ci-cd/) — Automate scanning in your pipeline
