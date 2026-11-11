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
      <PageHeader title={`売上 ${sale.code}`} />
      <Notice />

      <dl className="details">
        <dt>売上日時</dt>
        <dd>{formatDateTime(sale.sale_date)}</dd>
        <dt>合計金額</dt>
        <dd>{formatMoney(sale.total_amount)}</dd>
      </dl>

      <section className="section">
        <h2>売上明細</h2>
        <p className="muted">単価は販売時点の価格です。</p>
        <DataTable
          columns={[
            { header: '商品名', render: (d) => <Link to={`/products/${d.product_id}`}>{d.product_name}</Link> },
            { header: '数量', render: (d) => d.quantity, align: 'right' },
            { header: '単価', render: (d) => formatMoney(d.unit_price), align: 'right' },
            { header: '小計', render: (d) => formatMoney(d.subtotal), align: 'right' },
          ]}
          rows={sale.details}
          rowKey={(d) => d.id}
          emptyMessage="この売上には明細がありません。"
          footer={
            <tr>
              <th colSpan={3} className="align-right">
                合計
              </th>
              <td className="align-right">
                <strong>{formatMoney(sale.total_amount)}</strong>
              </td>
            </tr>
          }
        />
      </section>

      <p>
        <Link to="/sales">← 売上一覧へ戻る</Link>
      </p>
    </>
  )
}
