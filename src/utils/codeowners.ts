import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, relative, resolve } from 'path';
import { minimatch } from 'minimatch';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ParsedRule {
  pattern: string;
  owners: string[];
}

export interface OwnerStats {
  owner: string;
  totalInstances: number;
  uniqueComponents: number;
  fileCount: number;
  components: { name: string; instances: number }[];
  files: string[];
}

export interface MostSharedComponent {
  name: string;
  ownerCount: number;
  owners: string[];
}

export interface CodeownersReport {
  owners: OwnerStats[];
  totalOwners: number;
  totalInstances: number;
  unownedFiles: string[];
  unownedInstances: number;
  mostSharedComponent: MostSharedComponent | null;
}

// ── CODEOWNERS file discovery ──────────────────────────────────────────────

/**
 * Find CODEOWNERS file by searching standard locations relative to baseDir.
 * GitHub/GitLab look in: .github/, docs/, or root.
 */
export function findCodeownersFile(baseDir: string): string | null {
  const candidates = [
    join(baseDir, '.github', 'CODEOWNERS'),
    join(baseDir, 'CODEOWNERS'),
    join(baseDir, 'docs', 'CODEOWNERS'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

// ── CODEOWNERS parsing ─────────────────────────────────────────────────────

/**
 * Parse CODEOWNERS file content into an ordered list of rules.
 * Blank lines and comment lines (starting with #) are ignored.
 */
export function parseCodeowners(content: string): ParsedRule[] {
  const rules: ParsedRule[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [pattern, ...owners] = trimmed.split(/\s+/);
    if (pattern && owners.length > 0) {
      rules.push({ pattern, owners });
    }
  }
  return rules;
}

// ── File → owners matching ─────────────────────────────────────────────────

/**
 * Match a single file path (relative to repo root) against CODEOWNERS rules.
 * Follows GitHub semantics: last matching rule wins; returns [] if unowned.
 */
export function getFileOwners(
  relativeFilePath: string,
  rules: ParsedRule[]
): string[] {
  // Normalise to forward slashes
  const filePath = relativeFilePath.replace(/\\/g, '/');

  let matchedOwners: string[] = [];

  for (const rule of rules) {
    let pattern = rule.pattern;

    // If pattern has no slash (or only a trailing slash) → match on basename
    // e.g. "*.ts", "README.md"
    const hasSlash = pattern.replace(/^\//, '').includes('/');

    const mmOpts = { dot: true, nocase: false };

    let matched = false;

    if (!hasSlash) {
      // Match against the full path using matchBase (any directory)
      matched = minimatch(filePath, pattern, { ...mmOpts, matchBase: true });
    } else {
      // Strip leading slash for anchored patterns like "/src/**"
      const normalizedPattern = pattern.startsWith('/')
        ? pattern.slice(1)
        : pattern;

      // Also handle "src/" style patterns (match everything inside that dir)
      const glob = normalizedPattern.endsWith('/')
        ? `${normalizedPattern}**`
        : normalizedPattern;

      matched = minimatch(filePath, glob, mmOpts);
    }

    if (matched) {
      matchedOwners = rule.owners;
    }
  }

  return matchedOwners;
}

// ── Build CodeownersReport from raw scan data ──────────────────────────────

interface RawInstance {
  props?: Record<string, unknown>;
  location?: {
    file?: string;
    start?: { line: number; column: number };
  };
}

interface RawScanData {
  [componentName: string]: { instances: RawInstance[] };
}

/**
 * Given the absolute path of the scan output JSON and the repo root,
 * compute and return a CodeownersReport. Returns null if CODEOWNERS not found
 * or the scan file is not in raw-report format.
 */
export function buildCodeownersReport(
  scanData: RawScanData,
  repoRoot: string
): CodeownersReport | null {
  const codeownersPath = findCodeownersFile(repoRoot);
  if (!codeownersPath) return null;

  const rules = parseCodeowners(readFileSync(codeownersPath, 'utf-8'));

  // Collect per-owner stats
  // owner → { totalInstances, components: Map<name, count>, files: Set }
  const ownerMap = new Map<
    string,
    {
      totalInstances: number;
      components: Map<string, number>;
      files: Set<string>;
    }
  >();

  const unownedFiles = new Set<string>();
  let unownedInstances = 0;

  // For "most shared component" tracking
  // component → set of distinct owners
  const componentOwnerMap = new Map<string, Set<string>>();

  for (const [componentName, entry] of Object.entries(scanData)) {
    // Skip the injected __codeowners key if present
    if (componentName === '__codeowners') continue;

    if (!entry?.instances) continue;

    for (const instance of entry.instances) {
      const absFile = instance?.location?.file;
      if (!absFile) continue;

      const relFile = relative(repoRoot, resolve(absFile)).replace(/\\/g, '/');
      const owners = getFileOwners(relFile, rules);

      if (owners.length === 0) {
        unownedFiles.add(relFile);
        unownedInstances++;
        continue;
      }

      // Track component owners
      if (!componentOwnerMap.has(componentName)) {
        componentOwnerMap.set(componentName, new Set());
      }

      for (const owner of owners) {
        // Attribute full instance to every owner (user-confirmed strategy)
        if (!ownerMap.has(owner)) {
          ownerMap.set(owner, {
            totalInstances: 0,
            components: new Map(),
            files: new Set(),
          });
        }
        const stats = ownerMap.get(owner)!;
        stats.totalInstances++;
        stats.components.set(
          componentName,
          (stats.components.get(componentName) ?? 0) + 1
        );
        stats.files.add(relFile);
        componentOwnerMap.get(componentName)!.add(owner);
      }
    }
  }

  // Build sorted OwnerStats array
  const owners: OwnerStats[] = Array.from(ownerMap.entries())
    .map(([owner, stats]) => ({
      owner,
      totalInstances: stats.totalInstances,
      uniqueComponents: stats.components.size,
      fileCount: stats.files.size,
      components: Array.from(stats.components.entries())
        .map(([name, instances]) => ({ name, instances }))
        .sort((a, b) => b.instances - a.instances),
      files: Array.from(stats.files).sort(),
    }))
    .sort((a, b) => b.totalInstances - a.totalInstances);

  // Most shared component
  let mostSharedComponent: MostSharedComponent | null = null;
  let maxOwnerCount = 0;
  for (const [name, ownerSet] of componentOwnerMap.entries()) {
    if (ownerSet.size > maxOwnerCount) {
      maxOwnerCount = ownerSet.size;
      mostSharedComponent = {
        name,
        ownerCount: ownerSet.size,
        owners: Array.from(ownerSet),
      };
    }
  }

  const totalInstances = owners.reduce((s, o) => s + o.totalInstances, 0);

  return {
    owners,
    totalOwners: owners.length,
    totalInstances,
    unownedFiles: Array.from(unownedFiles),
    unownedInstances,
    mostSharedComponent,
  };
}

// ── Enrich scan file with codeowners data ─────────────────────────────────

/**
 * Read the scan output JSON, compute codeowners data, and write it back
 * as a __codeowners key in the same file. Returns true if enriched.
 */
export function enrichScanFileWithCodeowners(
  scanFilePath: string,
  repoRoot: string
): boolean {
  if (!existsSync(scanFilePath)) return false;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(readFileSync(scanFilePath, 'utf-8'));
  } catch {
    return false;
  }

  const report = buildCodeownersReport(parsed as RawScanData, repoRoot);
  if (!report) return false;

  parsed['__codeowners'] = report;
  writeFileSync(scanFilePath, JSON.stringify(parsed, null, 2), 'utf-8');
  return true;
}

/**
 * Extract the __codeowners data from a scan file. Returns null if absent.
 */
export function readCodeownersFromScanFile(
  scanFilePath: string
): CodeownersReport | null {
  if (!existsSync(scanFilePath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(scanFilePath, 'utf-8'));
    return (parsed['__codeowners'] as CodeownersReport) ?? null;
  } catch {
    return null;
  }
}
