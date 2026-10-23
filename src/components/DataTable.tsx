import type { Key, ReactNode } from 'react'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => Key
  emptyMessage: string
  emptyAction?: ReactNode
  footer?: ReactNode
}

// Generic table: the page describes the columns, the table handles layout and the empty case.
export function DataTable<T>({ columns, rows, rowKey, emptyMessage, emptyAction, footer }: DataTableProps<T>) {
  if (rows.length === 0) return <EmptyState message={emptyMessage} action={emptyAction} />

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={column.align === 'right' ? 'align-right' : undefined}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.header} className={column.align === 'right' ? 'align-right' : undefined}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  )
}
