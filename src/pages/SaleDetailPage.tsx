import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '../components/DataTable'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { Notice } from '../components/Notice'
import { PageHeader } from '../components/PageHeader'
import { useAsync } from '../hooks/useAsync'
import { useIdParam } from '../hooks/useIdParam'
import { getSale } from '../services/saleService'
import { formatDateTime, formatMoney } from '../utils/format'
import { NotFoundPage } from './NotFoundPage'

export function SaleDetailPage() {
  const id = useIdParam()
  if (id === null) return <NotFoundPage />
  return <SaleDetail id={id} />
}

function SaleDetail({ id }: { id: number }) {
  const load = useCallback((signal: AbortSignal) => getSale(id, signal), [id])
  const { data: sale, error, loading, reload } = useAsync(load)

  if (loading) return <Loading />
  if (error !== undefined || !sale) return <ErrorMessage error={error} onRetry={reload} />

  return (
    <>
      <PageHeader title={`Sale #${sale.id}`} />
      <Notice />

      <dl className="details">
        <dt>Date</dt>
        <dd>{formatDateTime(sale.sale_date)}</dd>
        <dt>Total</dt>
        <dd>{formatMoney(sale.total_amount)}</dd>
      </dl>

      <section className="section">
        <h2>Sale details</h2>
        <p className="muted">Unit prices are the prices at the time of sale.</p>
        <DataTable
          columns={[
            { header: 'Product', render: (d) => <Link to={`/products/${d.product_id}`}>{d.product_name}</Link> },
            { header: 'Quantity', render: (d) => d.quantity, align: 'right' },
            { header: 'Unit price', render: (d) => formatMoney(d.unit_price), align: 'right' },
            { header: 'Subtotal', render: (d) => formatMoney(d.subtotal), align: 'right' },
          ]}
          rows={sale.details}
          rowKey={(d) => d.id}
          emptyMessage="This sale has no items."
          footer={
            <tr>
              <th colSpan={3} className="align-right">
                Total
              </th>
              <td className="align-right">
                <strong>{formatMoney(sale.total_amount)}</strong>
              </td>
            </tr>
          }
        />
      </section>

      <p>
        <Link to="/sales">← Back to sales</Link>
      </p>
    </>
  )
}
