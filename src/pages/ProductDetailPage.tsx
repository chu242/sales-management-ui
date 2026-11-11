import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { Notice } from '../components/Notice'
import { PageHeader } from '../components/PageHeader'
import { useAsync } from '../hooks/useAsync'
import { useIdParam } from '../hooks/useIdParam'
import { deleteProduct, getProduct } from '../services/productService'
import { formatMoney } from '../utils/format'
import { NotFoundPage } from './NotFoundPage'

export function ProductDetailPage() {
  const id = useIdParam()
  if (id === null) return <NotFoundPage />
  return <ProductDetail id={id} />
}

function ProductDetail({ id }: { id: number }) {
  const navigate = useNavigate()
  const load = useCallback((signal: AbortSignal) => getProduct(id, signal), [id])
  const { data: product, error, loading, reload } = useAsync(load)
  const [confirming, setConfirming] = useState(false)

  if (loading) return <Loading />
  if (error !== undefined || !product) return <ErrorMessage error={error} onRetry={reload} />

  async function confirmDelete() {
    await deleteProduct(id)
    navigate('/products', { state: { notice: `商品「${product?.name}」を削除しました。` } })
  }

  return (
    <>
      <PageHeader
        title={product.name}
        actions={
          <>
            <Link to={`/products/${id}/edit`} className="button">
              編集
            </Link>
            <button type="button" className="button button-danger" onClick={() => setConfirming(true)}>
              削除
            </button>
          </>
        }
      />
      <Notice />

      <dl className="details">
        <dt>ID</dt>
        <dd>{product.id}</dd>
        <dt>商品コード</dt>
        <dd>{product.code}</dd>
        <dt>商品価格</dt>
        <dd>{formatMoney(product.price)}</dd>
        <dt>数量</dt>
        <dd>{product.stock}</dd>
      </dl>

      <p>
        <Link to="/products">← 商品一覧へ戻る</Link>
      </p>

      <ConfirmDialog
        open={confirming}
        title="商品を削除しますか？"
        message={`「${product.name}」を完全に削除します。売上に含まれる商品は削除できません。`}
        onConfirm={confirmDelete}
        onClose={() => setConfirming(false)}
      />
    </>
  )
}
