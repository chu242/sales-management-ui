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
        title="ダッシュボード"
        actions={
          <Link to="/sales/new" className="button button-primary">
            売上登録
          </Link>
        }
      />

      <div className="stat-grid">
        <StatCard label="商品数" value={products.length} />
        <StatCard label="在庫総数" value={unitsInStock.toLocaleString()} />
        <StatCard label="売上件数" value={sales.length} />
        <StatCard label="売上合計" value={formatCents(revenueCents)} />
      </div>

      <section className="section">
        <h2>在庫僅少（{LOW_STOCK_THRESHOLD}以下）</h2>
        <DataTable
          columns={[
            { header: '商品名', render: (p) => <Link to={`/products/${p.id}`}>{p.name}</Link> },
            { header: '商品価格', render: (p) => formatMoney(p.price), align: 'right' },
            { header: '数量', render: (p) => <span className={p.stock === 0 ? 'text-danger' : undefined}>{p.stock}</span>, align: 'right' },
          ]}
          rows={lowStock}
          rowKey={(p) => p.id}
          emptyMessage="在庫が少ない商品はありません。"
        />
      </section>

      <section className="section">
        <h2>最近の売上</h2>
        <DataTable
          columns={[
            { header: '売上コード', render: (s) => <Link to={`/sales/${s.id}`}>{s.code}</Link> },
            { header: '売上日時', render: (s) => formatDateTime(s.sale_date) },
            { header: '明細数', render: (s) => s.details.length, align: 'right' },
            { header: '合計金額', render: (s) => formatMoney(s.total_amount), align: 'right' },
          ]}
          rows={recentSales}
          rowKey={(s) => s.id}
          emptyMessage="売上はまだありません。"
          emptyAction={
            <Link to="/sales/new" className="button button-primary">
              最初の売上を登録
            </Link>
          }
        />
      </section>
    </>
  )
}
