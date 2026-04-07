---
description: Usage by Packages is a coming-soon dashboard view that will break down component usage across individual packages in a monorepo.
---

# Usage by Packages

::: warning Coming Soon
This feature is currently under development and is not yet available. This page describes the planned functionality so you can prepare your project when it ships.
:::

## Overview

**Usage by Packages** will give you a package-level breakdown of component usage across a monorepo. Instead of seeing aggregate counts for the entire repository, you will be able to drill into each individual package — `apps/web`, `packages/checkout`, `libs/shared-ui`, and so on — and understand exactly how components from your design system are distributed across them.

## Planned Features

### Per-Package Usage Breakdown

Each package in your monorepo will have its own row in the dashboard, showing:

- Total component instances found within that package
- Number of distinct component types used
- Which components are most used locally vs. across the repo

### Cross-Package Dependency View

See which components are shared across multiple packages, making it easy to assess the blast radius of API changes or deprecations before they happen.

### Package Adoption Heatmap

A visual overview of how thoroughly each package adopts the design system, helping you identify packages that are lagging behind or relying on bespoke UI code instead of shared components.

### Filtering and Sorting

Slice the data by package name, component name, or usage volume — and sort by any column to surface the most relevant information for your current task.

## How It Will Work

The feature will build on the same `raw-report` scan output that [Code Owners](/features/codeowners) already uses. No additional configuration will be required — React Scanner Studio will automatically detect monorepo package boundaries by looking for `package.json` files within the scanned directory tree.

## Stay Updated

- ⭐ [Star the repo on GitHub](https://github.com/vimalmunjani/react-scanner-studio) to be notified of new releases
- 💬 [Join the discussion](https://github.com/vimalmunjani/react-scanner-studio/discussions) to share what you'd like to see in this feature
- 🎮 [Join Discord](https://discord.gg/PU5xrNVd) for real-time updates

## See Also

- [Code Owners](/features/codeowners) — Already available: map component usage to your CODEOWNERS file
- [Configuration Options](/configuration/options) — Set up the `raw-report` processor needed by advanced dashboard features
- [scan](/cli/scan) — Scan command reference
