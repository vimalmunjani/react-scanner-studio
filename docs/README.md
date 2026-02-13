# React Scanner Studio Documentation

This directory contains the VitePress documentation for React Scanner Studio.

## Structure

```
docs/
├── .vitepress/
│   ├── config.ts          # VitePress configuration
│   └── theme/
│       ├── custom.css     # Custom styles
│       └── index.ts       # Theme configuration
├── guide/
│   ├── index.md           # What is React Scanner Studio?
│   ├── installation.md    # Installation guide
│   └── quick-start.md     # Quick start tutorial
├── cli/
│   ├── index.md           # CLI overview
│   ├── init.md            # init command
│   ├── start.md           # start command
│   └── build.md           # build command
├── configuration/
│   ├── index.md           # Configuration overview
│   └── options.md         # Configuration options reference
├── advanced/
│   ├── ci-cd/
│   │   ├── index.md           # CI/CD overview
│   │   ├── github-actions.md  # GitHub Actions guide
│   │   ├── gitlab-ci.md       # GitLab CI guide
│   │   ├── circleci.md        # CircleCI guide
│   │   └── azure-pipelines.md # Azure Pipelines guide
│   └── troubleshooting.md     # Troubleshooting guide
├── public/
│   ├── logo.png           # Logo image
│   └── favicon.ico        # Favicon
├── index.md               # Home page
└── README.md              # This file
```

## Development

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm

### Running Locally

```bash
# Install dependencies
npm install

# Start the development server
npm run docs:dev
```

The documentation site will be available at `http://localhost:5173`.

### Building for Production

```bash
# Build the documentation
npm run docs:build

# Preview the production build
npm run docs:preview
```

### Available Scripts

| Script | Description |
| ------ | ----------- |
| `docs:dev` | Start the development server |
| `docs:build` | Build the documentation for production |
| `docs:preview` | Preview the production build locally |

## Writing Documentation

### File Naming

- Use kebab-case for file names (e.g., `quick-start.md`)
- Index files should be named `index.md`

### Frontmatter

Each markdown file can include frontmatter:

```yaml
---
title: Page Title
description: Page description for SEO
---
```

### VitePress Features

This documentation uses VitePress features including:

- **Code groups** — Use `::: code-group` for tabbed code blocks
- **Custom containers** — Use `::: tip`, `::: warning`, `::: danger`
- **Line highlighting** — Use `{1,3-5}` after the language identifier

### Adding New Pages

1. Create the markdown file in the appropriate directory
2. Add the page to the sidebar in `.vitepress/config.ts`
3. Link to the page from related documentation

## Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.

## Contributing

When contributing to the documentation:

1. Follow the existing structure and formatting
2. Test all code examples
3. Update the sidebar configuration if adding new pages
4. Verify links work correctly

## Resources

- [VitePress Documentation](https://vitepress.dev/)
- [Markdown Guide](https://www.markdownguide.org/)
- [React Scanner Studio Repository](https://github.com/vimalmunjani/react-scanner-studio)
