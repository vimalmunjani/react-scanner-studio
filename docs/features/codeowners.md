---
description: Automatically attribute component usage to teams using your CODEOWNERS file. Surface ownership gaps, cross-team impact, and design system adoption spread per team.
---

# Code Owners

React Scanner Studio automatically correlates component usage data with your repository's `CODEOWNERS` file — giving you a per-team breakdown of which components each team uses, how broadly design system components are shared across teams, and which files have no declared owner at all.

## Why This Matters

In large organisations, a single design system component can be used by dozens of teams. Without ownership visibility it is easy to:

- **Miss coverage gaps** — a component that nobody owns is a component that nobody maintains or adopts consistently
- **Underestimate cross-team impact** — a refactor or breaking change in a heavily shared component silently affects many teams
- **Overlook low-adoption teams** — aggregate usage numbers hide which teams are barely touching the design system

The Code Owners feature surfaces these insights automatically, with zero extra configuration beyond a `CODEOWNERS` file that most repositories already have.

---

## Prerequisites

Two things must be in place before Code Owners data appears in the dashboard.

### 1. `raw-report` processor

Your `react-scanner.config.*` must use the **`raw-report`** processor (not `count-components`). Code Owners matching requires each component instance's exact **file path**, which only `raw-report` records.

```js
// react-scanner.config.js
module.exports = {
  crawlFrom: './src',
  importedFrom: '@mycompany/design-system',
  processors: [
    [
      'raw-report',
      {
        outputTo: './.react-scanner-studio/scan-report.json',
      },
    ],
  ],
};
```

::: warning count-components is not supported
If your config uses the `count-components` processor, the Code Owners page will display a **"raw-report format required"** message and no ownership data will be shown. Switch to `raw-report` to enable this feature.
:::

### 2. A `CODEOWNERS` file

React Scanner Studio looks for a `CODEOWNERS` file in the following locations, **relative to the directory that contains your `react-scanner.config.*`**, checking them in order:

| Priority | Path                 |
| -------- | -------------------- |
| 1st      | `.github/CODEOWNERS` |
| 2nd      | `CODEOWNERS`         |
| 3rd      | `docs/CODEOWNERS`    |

The first file found is used. If none of these paths exist, the feature is silently skipped and scanning continues normally — nothing breaks.

---

## How It Works

Code Owners enrichment is **fully automatic** — there is nothing to enable or configure. After every successful `scan` command:

1. React Scanner Studio searches for a `CODEOWNERS` file in the three locations above.
2. If found, the file is parsed following **GitHub semantics**: the **last matching rule wins** for any given file path.
3. Every component instance in the scan output is matched to the owner(s) of the file it appears in.
4. Ownership data is computed and saved into your `scan-report.json` for use by the dashboard.
5. The dashboard reads this data and populates the Code Owners page automatically.

The enrichment step is **non-fatal**. If the `CODEOWNERS` file cannot be found, read, or parsed — or if no patterns match any scanned file — the scan result is left untouched and no error is surfaced.

::: info Instance attribution across multiple owners
Each component instance is attributed to **every owner** listed on a matching CODEOWNERS rule. If a file is owned by both `@org/checkout` and `@org/security`, a single component instance in that file counts toward both teams' totals.
:::

---

## Setting Up Your CODEOWNERS File

### Where to Place It

The recommended location — and the one GitHub itself uses — is `.github/CODEOWNERS`. This is the first path React Scanner Studio checks, so no additional configuration is needed.

```
my-project/
├── .github/
│   └── CODEOWNERS        ← recommended
├── src/
│   └── ...
└── react-scanner.config.js
```

Alternatively, place the file at the repository root (`CODEOWNERS`) or inside `docs/CODEOWNERS` if that better fits your project's conventions.

### Syntax

The CODEOWNERS format is identical to GitHub's: each non-blank, non-comment line is a **glob pattern** followed by one or more **owner handles** (GitHub usernames prefixed with `@`, or team slugs in the form `@org/team-name`).

```
# Lines beginning with # are comments and are ignored entirely

# Catch-all: every file defaults to the platform team
*                                   @org/platform

# All files under src/checkout/ belong to the checkout team
src/checkout/                       @org/checkout

# The user profile screens are owned by accounts
src/profile/                        @org/accounts

# Any shared UI component wrappers in any directory
src/**/components/ui/               @org/design-system

# A specific file has two co-owners
src/checkout/PaymentForm.tsx        @org/checkout @org/security
```

::: tip Last rule wins
CODEOWNERS files use **last-matching-rule semantics**. A specific rule placed _after_ a broad catch-all will override it for the matched paths. Always put general rules first and the most specific rules last.
:::

### Pattern Matching Reference

React Scanner Studio matches file paths using the same rules GitHub uses. Here is a quick reference:

| Pattern         | What It Matches                                            |
| --------------- | ---------------------------------------------------------- |
| `*`             | Every file in the repository                               |
| `*.tsx`         | Any `.tsx` file in any directory                           |
| `src/`          | Everything inside `src/` (recursively)                     |
| `src/checkout/` | Everything inside `src/checkout/` (recursively)            |
| `/src/App.tsx`  | Exactly `src/App.tsx` anchored at the repository root      |
| `docs/*.md`     | `.md` files directly inside `docs/`, not in subdirectories |
| `**/utils/`     | Any directory named `utils/` at any depth                  |
| `*.config.ts`   | Any file ending in `.config.ts` in any directory           |

::: info Patterns without a path separator
Patterns that contain no `/` character (or only a trailing `/`) are matched against the file **basename** in any directory. For example, `*.stories.tsx` will match `src/components/Button/Button.stories.tsx`.
:::

---

## Dashboard Features

Once a scan with Code Owners data has been run, the **Code Owners** page becomes available in the sidebar. It is composed of the following sections.

### Summary Cards

Four at-a-glance statistics appear across the top of the page:

| Card                      | What It Shows                                                                 |
| ------------------------- | ----------------------------------------------------------------------------- |
| **Total Owners**          | Number of distinct owner handles with at least one matched component instance |
| **Avg Instances / Owner** | Mean component instance count across all owners                               |
| **Top Owner**             | The owner handle with the highest total instance count                        |
| **Unowned Files**         | Count of files matched by zero CODEOWNERS rules (shown with an amber warning) |

### Ownership Distribution Chart

A donut chart showing the share of total component instances attributed to the top 6 owners, with all remaining owners grouped into an **"Others"** bucket. This gives an instant read on whether design system usage is evenly distributed across the organisation or concentrated in a small number of teams.

### Most Cross-Team Component

Highlights the single component that appears in files owned by the greatest number of **distinct teams**. This component has the widest blast radius for any breaking change, API redesign, or deprecation — it is the first place to start when planning coordinated migration work.

### Adoption Spread

A horizontal bar chart of the **top 5 owners ranked by distinct component types used**. This measures breadth of adoption rather than raw volume: a team using 25 different components from the design system has broader adoption than a team that uses the same single component 200 times. Low-spread teams are the best candidates for design system onboarding or enablement sessions.

### Owner Table

A sortable table listing every owner with their full statistics. Columns include:

| Column         | Description                                                       |
| -------------- | ----------------------------------------------------------------- |
| **Owner**      | Team slug or individual GitHub handle                             |
| **Instances**  | Total component instances across all files owned by this team     |
| **Components** | Number of distinct component types used in their files            |
| **Files**      | Number of owned files that contain at least one tracked component |

Click any row to open a **detail drawer** that shows the complete ranked list of components (with per-component instance counts) and the full list of files owned by that team.

### Unowned Files Panel

A collapsible panel listing every file that contained at least one tracked component instance but matched **no CODEOWNERS rule**. A **"Copy all"** button copies the entire list to the clipboard, making it straightforward to paste directly into your `CODEOWNERS` file and assign the missing owners.

---

## Interpreting the Data

### Unowned Files

Unowned files are the most immediately actionable output of this feature. They represent real component usage with no declared owner — meaning there is no team accountable for reviewing changes, maintaining consistency, or answering questions about how those components are used.

**Recommended workflow:**

1. Open the Unowned Files panel on the Code Owners page.
2. Click **"Copy all"** to copy the file list to your clipboard.
3. Open your `CODEOWNERS` file and add rules that assign each file to the appropriate team.
4. Re-run the scan to confirm the unowned count drops to zero.

### Adoption Spread

Use the Adoption Spread chart to identify teams that may need design system support:

- **Low spread (few distinct component types):** The team may be new to the design system, working in a narrow domain, or building custom components where design system ones would fit. This is a conversation starter for enablement.
- **High spread (many distinct component types):** The team is a power user. Their feedback on component APIs, documentation gaps, and missing components is especially valuable — consider involving them in design system governance.

### Most Cross-Team Component

The Most Cross-Team Component is the highest-risk component to change without coordination. Before shipping a breaking change or deprecation for this component, use the `owners` list in the report to:

- **Notify all affected teams** before the release
- **Scope visual regression testing** to cover the patterns those teams use
- **Provide a migration guide** alongside the change so no team is left behind

---

## Example

### Sample CODEOWNERS File

```
# Default fallback — unclaimed files go to the platform team
*                                       @org/platform

# Product verticals
src/checkout/                           @org/checkout
src/profile/                            @org/accounts
src/discovery/                          @org/discovery
src/admin/                              @org/internal-tools

# Shared component wrappers maintained by the design system team
src/components/                         @org/design-system

# Payment-sensitive files have a co-owner for security review
src/checkout/PaymentForm.tsx            @org/checkout @org/security
src/checkout/CardInput.tsx              @org/checkout @org/security
```

### What You Would See in the Dashboard

With a codebase that uses `@mycompany/design-system` components and the `CODEOWNERS` file above, a typical report might surface the following:

- **`@org/checkout`** is the top owner with **340 instances** across 28 files, using 18 distinct component types — they are heavy consumers of the design system and likely have strong opinions on its API.
- **`@org/internal-tools`** uses only 4 component types across 12 files — low Adoption Spread, suggesting an opportunity to introduce more design system components to the admin panel and reduce bespoke UI code.
- **`Button`** is the Most Cross-Team Component, appearing in files owned by **6 distinct teams** — any change to `Button` has organisation-wide impact and should be communicated broadly before release.
- **`@org/checkout`** and **`@org/security`** both appear on `PaymentForm.tsx` and `CardInput.tsx`, so instances in those files are counted toward both teams.
- **7 unowned files** appear in the Unowned Files panel — files that fell through the `*` catch-all because they live outside every explicit pattern. Adding them to `CODEOWNERS` clears the amber warning.

---

## Empty States

The Code Owners page displays one of three empty states when data is unavailable:

| Message                        | Cause                                                        | Fix                                                            |
| ------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------- |
| **No CODEOWNERS file found**   | No `CODEOWNERS` file exists at any of the three search paths | Create `.github/CODEOWNERS` and re-run `scan`                  |
| **raw-report format required** | Config uses the `count-components` processor                 | Switch to `raw-report` in `react-scanner.config.*`             |
| **No ownership matches found** | `CODEOWNERS` exists but no pattern matched any scanned file  | Review your patterns — ensure they cover your `crawlFrom` path |

---

## See Also

- [Configuration Options](/configuration/options) — Set up the `raw-report` processor
- [scan](/cli/scan) — Scan command reference
- [CI/CD Integration](/advanced/ci-cd/) — Automate scanning and enrich reports on every build
- [Troubleshooting](/advanced/troubleshooting) — Fix common issues
- [Usage by Packages](/features/usage-by-packages) — Coming soon: per-package component usage breakdown
