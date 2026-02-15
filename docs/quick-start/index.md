---
description: Get up and running with React Scanner Studio in minutes. Choose automated, manual, or LLM-assisted setup.
---

# Quick Start

Get up and running with React Scanner Studio in just a few minutes. Choose the setup method that works best for you.

## Setup Options

| Method                               | Best For                                | Time       |
| ------------------------------------ | --------------------------------------- | ---------- |
| [Automated Setup](./automated)       | Most users, quick start                 | ~2 minutes |
| [Manual Setup](./manual)             | Full control, custom configurations     | ~5 minutes |
| [LLM-Assisted Setup](./llm-assisted) | AI-powered setup with context awareness | ~3 minutes |

## Automated Setup

The quickest way to get started. Run a single command and answer a few prompts:

```bash
npx react-scanner-studio init
```

[Get started with Automated Setup →](./automated)

## Manual Setup

For users who prefer full control over the configuration process:

1. Install dependencies
2. Create configuration file
3. Update ignore files
4. Add npm scripts

[Get started with Manual Setup →](./manual)

## LLM-Assisted Setup

Copy a prompt to your AI assistant (Claude, ChatGPT, Cursor, etc.) and let it configure everything based on your project context.

[Get started with LLM-Assisted Setup →](./llm-assisted)

## After Setup

Once you've completed any of the setup methods, you can:

```bash
# Start the dashboard (will prompt to scan if needed)
npm run scan:start

# Or manually scan first, then start
npm run scan
npm run scan:start

# Build static files for sharing
npm run scan:build
```

## What's Next?

- [CLI Commands](/cli/) — Learn about all available commands and options
- [Configuration](/configuration/) — Customize your react-scanner configuration
- [CI/CD Integration](/advanced/ci-cd/) — Automate scanning in your pipeline
