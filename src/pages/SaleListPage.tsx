import { Link } from 'react-router-dom'
import { DataTable } from '../components/DataTable'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { PageHeader } from '../components/PageHeader'
import { useAsync } from '../hooks/useAsync'
import { listSales } from '../services/saleService'
import { formatDateTime, formatMoney } from '../utils/format'

export function SaleListPage() {
  const { data: sales, error, loading, reload } = useAsync(listSales)

  return (
    <>
      <PageHeader
        title="Sales"
        actions={
          <Link to="/sales/new" className="button button-primary">
            New sale
          </Link>
        }
      />

      {loading && <Loading />}
      {!loading && error !== undefined && <ErrorMessage error={error} onRetry={reload} />}
      {sales && (
        <DataTable
          columns={[
            { header: 'Sale', render: (s) => <Link to={`/sales/${s.id}`}>#{s.id}</Link> },
            { header: 'Date', render: (s) => formatDateTime(s.sale_date) },
            { header: 'Products', render: (s) => s.details.map((d) => d.product_name).join(', ') },
            { header: 'Items', render: (s) => s.details.reduce((sum, d) => sum + d.quantity, 0), align: 'right' },
            { header: 'Total', render: (s) => formatMoney(s.total_amount), align: 'right' },
          ]}
          rows={sales}
          rowKey={(s) => s.id}
          emptyMessage="No sales yet."
          emptyAction={
            <Link to="/sales/new" className="button button-primary">
              Record the first sale
            </Link>
          }
        />
      )}
    </>
  )
}
