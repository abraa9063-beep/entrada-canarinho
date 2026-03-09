import { ReactNode } from 'react';
import clsx from 'clsx';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
  hidden?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  isCritical?: (item: T) => boolean;
}

export function Table<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
  isLoading = false,
  isCritical
}: TableProps<T>) {
  const visibleColumns = columns.filter((col) => !col.hidden);

  if (isLoading) {
    return (
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {visibleColumns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {visibleColumns.map((col) => (
                  <td key={col.key}>
                    <div style={{ 
                      height: '14px', 
                      background: 'var(--bg-hover)', 
                      borderRadius: '4px',
                      width: col.width ? undefined : '60%'
                    }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-wrapper">
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'var(--bg-hover)',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {visibleColumns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const critical = isCritical ? isCritical(item) : false;
            return (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={clsx(critical && 'critical', onRowClick && 'cursor-pointer')}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {visibleColumns.map((col) => (
                  <td key={col.key} style={{ width: col.width }}>
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
