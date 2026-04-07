# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-04-07

### Added

- **Code Owners Integration**
  - New `Code Owners` dashboard page with full ownership breakdown powered by your `.github/CODEOWNERS` file
  - Ownership stat cards (total owners, top owner, most shared component, unowned file count)
  - Interactive donut chart showing component instance distribution by owner — with hover dimming and animated transitions
  - Adoption Spread panel showing distinct component types per owner
  - Most Cross-Team Component insight with tooltip explaining cross-team impact
  - Owner table with sortable columns (owner, instances, components, files, % of total) and live search
  - Owner detail panel (slide-in sheet) with per-owner component usage bar chart and file list (flat & grouped view)
  - Unowned files accordion — collapsed by default with smooth open/close animation and "Copy all" action
  - `CodeownersSummary` card on the main Dashboard showing the donut chart, legend, and key stats at a glance
  - `CopyablePath` component for inline path display with a one-click copy icon
  - Ownership data is automatically enriched into the scan output JSON and served via a new `/api/codeowners-data` endpoint

### Changed

- **Dashboard UX**
  - "Explore more" buttons in `Component Usage` and `Code Owners` cards now use primary-color text for better visual prominence
  - File lists in the owner detail panel use divider rows instead of individual bordered cards for a cleaner layout
  - Owner table bar indicator matches the slimmer style used in the Component Inventory table

### Fixed

- Dark-mode tooltip text is now readable across all Recharts charts (bar, donut, props chart)

## [1.2.0] - 2026-02-26

### Added
- **Configuration Flexibility**
  - Added support for all `react-scanner.config.*` file extensions, including `.ts`, `.mjs`, `.cjs`, `.mts`, and `.cts`.
  - Integrated `jiti` for seamless TypeScript and ES module configuration loading.

## [1.1.0] - 2026-02-17

### Changed
- Migrated UI build and development workflow from Vite to **Rspack** for compatibility and improved performance.

### Fixed
- Streamlined documentation by simplifying titles and removing redundant comparison tables.

## [1.0.0] - 2026-02-14

### Added

- **CLI Commands**
  - `init` — Initialize react-scanner configuration in your project
  - `scan` — Scan your codebase for component usage using react-scanner
  - `start` — Start the interactive dashboard development server
  - `build` — Build a portable, static version of the dashboard

- **Interactive Dashboard**
  - Component usage overview with visual statistics
  - Detailed component inventory with search and filtering
  - Prop usage analysis and patterns
  - Treemap visualization for component distribution
  - Usage charts and trends

- **Developer Experience**
  - Zero config setup with automatic configuration generation
  - Auto-detection of popular component libraries (MUI, Chakra, Ant Design, etc.)
  - Automatic react-scanner installation if not present
  - CI/CD mode with `--ci` flag for non-interactive environments
  - Custom port configuration with `--port` flag
  - Auto-open browser with `--open` flag

- **Portability**
  - Static HTML build output for hosting anywhere
  - Self-contained dashboard with no server required
  - Shareable reports for team collaboration

- **Documentation**
  - Comprehensive documentation site
  - Quick start guides (automated, manual, LLM-assisted)
  - CLI command reference
  - Configuration options guide
  - CI/CD integration guides for GitHub Actions, GitLab CI, CircleCI, and Azure Pipelines
  - Troubleshooting guide

[1.2.0]: https://github.com/vimalmunjani/react-scanner-studio/releases/tag/v1.2.0
[1.1.1]: https://github.com/vimalmunjani/react-scanner-studio/releases/tag/v1.1.0
[1.0.0]: https://github.com/vimalmunjani/react-scanner-studio/releases/tag/v1.0.0
