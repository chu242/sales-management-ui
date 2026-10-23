import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '../components/DataTable'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { LOW_STOCK_THRESHOLD } from '../config'
import { useAsync } from '../hooks/useAsync'
import { listProducts } from '../services/productService'
import { listSales } from '../services/saleService'
import { formatCents, formatDateTime, formatMoney, toCents } from '../utils/format'

// The backend has no summary endpoint, so the dashboard is computed from the full
// product and sale lists. Fine for this data size; a large shop would add GET /summary.
export function DashboardPage() {
  const load = useCallback(
    // Both requests run in parallel; if either fails, the whole page shows the error.
    (signal: AbortSignal) => Promise.all([listProducts(signal), listSales(signal)]),
    [],
  )
  const { data, error, loading, reload } = useAsync(load)

  if (loading) return <Loading />
  if (error || !data) return <ErrorMessage error={error} onRetry={reload} />

  const [products, sales] = data
  const unitsInStock = products.reduce((sum, p) => sum + p.stock, 0)
  const revenueCents = sales.reduce((sum, s) => sum + toCents(s.total_amount), 0)
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
  const recentSales = sales.slice(0, 5) // the backend returns newest first

  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          <Link to="/sales/new" className="button button-primary">
            New sale
          </Link>
        }
      />

      <div className="stat-grid">
        <StatCard label="Products" value={products.length} />
        <StatCard label="Units in stock" value={unitsInStock.toLocaleString()} />
        <StatCard label="Sales" value={sales.length} />
        <StatCard label="Total revenue" value={formatCents(revenueCents)} />
      </div>

      <section className="section">
        <h2>Low stock (≤ {LOW_STOCK_THRESHOLD})</h2>
        <DataTable
          columns={[
            { header: 'Product', render: (p) => <Link to={`/products/${p.id}`}>{p.name}</Link> },
            { header: 'Price', render: (p) => formatMoney(p.price), align: 'right' },
            { header: 'Stock', render: (p) => <span className={p.stock === 0 ? 'text-danger' : undefined}>{p.stock}</span>, align: 'right' },
          ]}
          rows={lowStock}
          rowKey={(p) => p.id}
          emptyMessage="All products are well stocked."
        />
      </section>

      <section className="section">
        <h2>Recent sales</h2>
        <DataTable
          columns={[
            { header: 'Sale', render: (s) => <Link to={`/sales/${s.id}`}>#{s.id}</Link> },
            { header: 'Date', render: (s) => formatDateTime(s.sale_date) },
            { header: 'Items', render: (s) => s.details.length, align: 'right' },
            { header: 'Total', render: (s) => formatMoney(s.total_amount), align: 'right' },
          ]}
          rows={recentSales}
          rowKey={(s) => s.id}
          emptyMessage="No sales yet."
          emptyAction={
            <Link to="/sales/new" className="button button-primary">
              Record the first sale
            </Link>
          }
        />
      </section>
    </>
  )
}
