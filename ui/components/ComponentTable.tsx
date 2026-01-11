import { useState } from 'react';
import type { ScanData } from './App';
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  const toggleRow = (name: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  // Transform data into array and sort
  const components = Object.entries(data).map(([name, info]) => ({
    name,
    count: info.instances,
    props: info.props || {},
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
    return <div className='empty-state'>No components found in scan data.</div>;
  }

  return (
    <div className='table-container'>
      <table className='component-table'>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              Component
              <span className='sort-indicator'>{getSortIndicator('name')}</span>
            </th>
            <th onClick={() => handleSort('count')}>
              Usage Count
              <span className='sort-indicator'>
                {getSortIndicator('count')}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {components.map(component => {
            const isExpanded = expandedRows.has(component.name);
            const hasProps = Object.keys(component.props).length > 0;
            const sortedProps = Object.entries(component.props).sort(
              ([, a], [, b]) => b - a
            );

            return (
              <>
                <tr
                  key={component.name}
                  onClick={() => toggleRow(component.name)}
                  className={`clickable-row ${isExpanded ? 'expanded' : ''} ${hasProps ? 'has-props' : ''}`}
                >
                  <td className='component-name'>
                    <span
                      className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                    >
                      {hasProps ? '▶' : ''}
                    </span>
                    {component.name}
                  </td>
                  <td className='count'>{component.count}</td>
                </tr>
                {isExpanded && hasProps && (
                  <tr key={`${component.name}-props`} className='props-row'>
                    <td colSpan={2}>
                      <div className='props-container'>
                        <span className='props-label'>Props:</span>
                        <div className='props-chips'>
                          {sortedProps.map(([propName, propCount]) => (
                            <span key={propName} className='prop-chip'>
                              {propName}
                              <span className='prop-count'>{propCount}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
          <tr className='total-row'>
            <td>Total</td>
            <td className='count'>{totalCount}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
