// ── count-components format ──
// { "Text": 10, "Button": 5, "Link": 3 }
export type CountComponentsReport = Record<string, number>;

// ── count-components-and-props format ──
// { "Text": { instances: 17, props: { margin: 6, color: 4 } } }
export interface CountComponentsAndPropsEntry {
  instances: number;
  props: Record<string, number>;
}
export type CountComponentsAndPropsReport = Record<
  string,
  CountComponentsAndPropsEntry
>;

// ── raw-report format ──
export interface RawReportInstance {
  importInfo?: {
    imported: string;
    local: string;
    moduleName: string;
  };
  props: Record<string, unknown>;
  propsSpread: boolean;
  location: {
    file: string;
    start: { line: number; column: number };
  };
}
export interface RawReportEntry {
  instances: RawReportInstance[];
}
export type RawReportReport = Record<string, RawReportEntry>;

// ── Unified / normalized format used by the dashboard ──
export type ReportFormat =
  | 'count-components'
  | 'count-components-and-props'
  | 'raw-report';

export interface NormalizedComponent {
  name: string;
  instances: number;
  props: Record<string, number>; // prop name → usage count
  propValues: Record<string, Record<string, number>>; // prop name → value → count
  files: { file: string; line: number; column: number }[];
  propsSpreadCount: number;
}

export interface ZombieProp {
  component: string;
  prop: string;
  usageCount: number;
}

export interface NormalizedReport {
  format: ReportFormat;
  components: NormalizedComponent[];
  totalInstances: number;
  totalUniqueComponents: number;
  totalUniqueProps: number;
  totalFiles: number;
  zombieProps: ZombieProp[];
}
