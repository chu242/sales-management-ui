import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { PageHeader } from '../components/PageHeader'
import { SaleItemsEditor } from '../components/SaleItemsEditor'
import { useAsync } from '../hooks/useAsync'
import { listProducts } from '../services/productService'
import { createSale } from '../services/saleService'
import { ApiError, type FieldErrors } from '../types/api'
import type { Product } from '../types/product'
import type { SaleItemCreate } from '../types/sale'
import { formatCents } from '../utils/format'
import { estimateSubtotalCents, newSaleItemRow, type SaleItemRow } from '../utils/saleItems'

// Quick checks before sending, so obvious mistakes don't need a round trip.
// Stock may have changed since the page loaded, so the backend checks it again.
function validate(rows: SaleItemRow[], products: Product[]): FieldErrors {
  const errors: FieldErrors = {}
  rows.forEach((row, index) => {
    const product = products.find((p) => String(p.id) === row.productId)
    const quantity = Number(row.quantity)
    if (!product) errors[`items.${index}.product_id`] = '商品を選択してください。'
    if (!/^\d+$/.test(row.quantity) || quantity <= 0) errors[`items.${index}.quantity`] = '1以上の整数を入力してください。'
    else if (product && quantity > product.stock) errors[`items.${index}.quantity`] = `在庫は${product.stock}個しかありません。`
  })
  return errors
}

export function SaleCreatePage() {
  const { data: products, error, loading, reload } = useAsync(listProducts)

  if (loading) return <Loading />
  if (error !== undefined || !products) return <ErrorMessage error={error} onRetry={reload} />

  return (
    <>
      <PageHeader title="売上登録" />
      {products.length === 0 ? (
        <EmptyState
          message="売上を登録するには、先に商品を1つ以上登録してください。"
          action={
            <Link to="/products/new" className="button button-primary">
              商品を登録
            </Link>
          }
        />
      ) : (
        <SaleForm products={products} />
      )}
    </>
  )
}

function SaleForm({ products }: { products: Product[] }) {
  const navigate = useNavigate()
  const [rows, setRows] = useState<SaleItemRow[]>(() => [newSaleItemRow()])
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<unknown>(null)
  const [submitting, setSubmitting] = useState(false)

  const subtotals = rows.map((row) => estimateSubtotalCents(row, products))
  const estimatedTotal = subtotals.every((s) => s !== null) ? subtotals.reduce<number>((sum, s) => sum + (s ?? 0), 0) : null

  function changeRows(next: SaleItemRow[]) {
    setRows(next)
    setFieldErrors({}) // row indexes may have shifted, so old errors no longer line up
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validate(rows, products)
    setFieldErrors(errors)
    setSubmitError(null)
    if (Object.keys(errors).length > 0) return

    const items: SaleItemCreate[] = rows.map((row) => ({ product_id: Number(row.productId), quantity: Number(row.quantity) }))
    setSubmitting(true)
    try {
      const sale = await createSale({ items })
      navigate(`/sales/${sale.id}`, { state: { notice: '売上を登録しました。' } })
    } catch (err) {
      // 400 not enough stock / 404 product gone: show the backend's message above the form.
      // 422: also highlight the matching rows.
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors)
      setSubmitError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form form-wide" onSubmit={handleSubmit} noValidate>
      {submitError !== null && <ErrorMessage error={submitError} />}

      <SaleItemsEditor products={products} rows={rows} onChange={changeRows} errors={fieldErrors} disabled={submitting} />

      <p className="estimated-total">
        合計金額（見込み）: <strong>{estimatedTotal === null ? '–' : formatCents(estimatedTotal)}</strong>
        <span className="muted">（確定金額はサーバーで計算されます）</span>
      </p>

      <div className="form-actions">
        <button type="button" className="button" onClick={() => navigate('/sales')} disabled={submitting}>
          キャンセル
        </button>
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? '保存中…' : '登録'}
        </button>
      </div>
    </form>
  )
}
