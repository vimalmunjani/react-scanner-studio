import type {
  CountComponentsReport,
  CountComponentsAndPropsReport,
  RawReportReport,
  ReportFormat,
  NormalizedComponent,
  NormalizedReport,
  ZombieProp,
} from './report-types';

function detectFormat(data: unknown): ReportFormat | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return null;
  }

  const obj = data as Record<string, unknown>;
  const keys = Object.keys(obj);

  if (keys.length === 0) return null;

  // Sample multiple entries to make a robust decision
  let hasNumberValues = false;
  let hasArrayInstances = false;
  let hasNumberInstances = false;

  for (const key of keys) {
    const value = obj[key];

    if (typeof value === 'number') {
      hasNumberValues = true;
      continue;
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const entry = value as Record<string, unknown>;

      if (Array.isArray(entry.instances)) {
        hasArrayInstances = true;
      } else if (typeof entry.instances === 'number') {
        hasNumberInstances = true;
      }
    }
  }

  // Prioritize detection: raw-report > count-components-and-props > count-components
  if (hasArrayInstances) return 'raw-report';
  if (hasNumberInstances) return 'count-components-and-props';
  if (hasNumberValues) return 'count-components';

  return null;
}

function normalizeCountComponents(
  data: Record<string, unknown>
): NormalizedComponent[] {
  const results: NormalizedComponent[] = [];

  for (const [name, value] of Object.entries(data)) {
    if (typeof value === 'number') {
      results.push({
        name,
        instances: value,
        props: {},
        propValues: {},
        files: [],
        propsSpreadCount: 0,
      });
    }
  }

  return results;
}

function normalizeCountComponentsAndProps(
  data: Record<string, unknown>
): NormalizedComponent[] {
  const results: NormalizedComponent[] = [];

  for (const [name, value] of Object.entries(data)) {
    if (typeof value !== 'object' || value === null) continue;

    const entry = value as Record<string, unknown>;
    const instanceCount =
      typeof entry.instances === 'number' ? entry.instances : 0;
    const props =
      typeof entry.props === 'object' && entry.props !== null
        ? (entry.props as Record<string, number>)
        : {};

    results.push({
      name,
      instances: instanceCount,
      props,
      propValues: {},
      files: [],
      propsSpreadCount: 0,
    });
  }

  return results;
}

function normalizeRawReport(
  data: Record<string, unknown>
): NormalizedComponent[] {
  const results: NormalizedComponent[] = [];

  for (const [name, value] of Object.entries(data)) {
    if (typeof value !== 'object' || value === null) continue;

    const entry = value as Record<string, unknown>;
    const instancesArr = Array.isArray(entry.instances) ? entry.instances : [];

    // Fallback: if this entry looks like count-components-and-props, handle gracefully
    if (!Array.isArray(entry.instances)) {
      const instanceCount =
        typeof entry.instances === 'number' ? entry.instances : 0;
      const props =
        typeof entry.props === 'object' && entry.props !== null
          ? (entry.props as Record<string, number>)
          : {};
      results.push({
        name,
        instances: instanceCount,
        props,
        propValues: {},
        files: [],
        propsSpreadCount: 0,
      });
      continue;
    }

    const propCounts: Record<string, number> = {};
    const propValues: Record<string, Record<string, number>> = {};
    const files: { file: string; line: number; column: number }[] = [];
    let propsSpreadCount = 0;

    for (const instance of instancesArr) {
      if (typeof instance !== 'object' || instance === null) continue;

      const inst = instance as Record<string, unknown>;
      const instProps =
        typeof inst.props === 'object' && inst.props !== null
          ? (inst.props as Record<string, unknown>)
          : {};

      // Count props
      for (const [propName, propValue] of Object.entries(instProps)) {
        propCounts[propName] = (propCounts[propName] ?? 0) + 1;

        // Track prop value distribution
        const valueStr =
          propValue === null
            ? '(boolean)'
            : typeof propValue === 'string'
              ? propValue
              : String(propValue);

        if (!propValues[propName]) {
          propValues[propName] = {};
        }
        propValues[propName][valueStr] =
          (propValues[propName][valueStr] ?? 0) + 1;
      }

      // Track files
      const location = inst.location as
        | { file: string; start: { line: number; column: number } }
        | undefined;
      if (location?.file && location?.start) {
        files.push({
          file: location.file,
          line: location.start.line,
          column: location.start.column,
        });
      }

      if (inst.propsSpread) {
        propsSpreadCount++;
      }
    }

    results.push({
      name,
      instances: instancesArr.length,
      props: propCounts,
      propValues,
      files,
      propsSpreadCount,
    });
  }

  return results;
}

export function parseReport(jsonString: string): NormalizedReport {
  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error(
      'Invalid JSON. Please check your report file and try again.'
    );
  }

  const format = detectFormat(data);

  if (!format) {
    throw new Error(
      'Unrecognized report format. Expected output from react-scanner using count-components, count-components-and-props, or raw-report processor.'
    );
  }

  let components: NormalizedComponent[];

  switch (format) {
    case 'count-components':
      components = normalizeCountComponents(data as CountComponentsReport);
      break;
    case 'count-components-and-props':
      components = normalizeCountComponentsAndProps(
        data as CountComponentsAndPropsReport
      );
      break;
    case 'raw-report':
      components = normalizeRawReport(data as RawReportReport);
      break;
  }

  // Sort by instance count descending
  components.sort((a, b) => b.instances - a.instances);

  const allProps = new Set<string>();
  const allFiles = new Set<string>();

  for (const comp of components) {
    for (const propName of Object.keys(comp.props)) {
      allProps.add(propName);
    }
    for (const file of comp.files) {
      allFiles.add(file.file);
    }
  }

  // Compute zombie props: props used only once across the entire codebase
  const zombieProps: ZombieProp[] = [];
  for (const comp of components) {
    for (const [propName, count] of Object.entries(comp.props)) {
      if (count === 1) {
        zombieProps.push({
          component: comp.name,
          prop: propName,
          usageCount: count,
        });
      }
    }
  }
  zombieProps.sort((a, b) => a.component.localeCompare(b.component));

  return {
    format,
    components,
    totalInstances: components.reduce((sum, c) => sum + c.instances, 0),
    totalUniqueComponents: components.length,
    totalUniqueProps: allProps.size,
    totalFiles: allFiles.size,
    zombieProps,
  };
}
