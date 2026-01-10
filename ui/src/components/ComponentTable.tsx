import { useState } from 'react';
import type { ScanData } from '../App';
import './ComponentTable.css';

interface ComponentTableProps {
  data: ScanData;
}

type SortKey = 'name' | 'count';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export function ComponentTable({ data }: ComponentTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'count',
    direction: 'desc',
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  // Transform data into array and sort
  const components = Object.entries(data).map(([name, info]) => ({
    name,
    count: info.instances || 0,
  }));

  components.sort((a, b) => {
    const aValue = sortConfig.key === 'name' ? a.name.toLowerCase() : a.count;
    const bValue = sortConfig.key === 'name' ? b.name.toLowerCase() : b.count;

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalCount = components.reduce((sum, c) => sum + c.count, 0);

  if (components.length === 0) {
    return <div className="empty-state">No components found in scan data.</div>;
  }

  return (
    <div className="table-container">
      <table className="component-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              Component
              <span className="sort-indicator">{getSortIndicator('name')}</span>
            </th>
            <th onClick={() => handleSort('count')}>
              Count
              <span className="sort-indicator">{getSortIndicator('count')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {components.map((component) => (
            <tr key={component.name}>
              <td className="component-name">{component.name}</td>
              <td className="count">{component.count}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td>Total</td>
            <td className="count">{totalCount}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
