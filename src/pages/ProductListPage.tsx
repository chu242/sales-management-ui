import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DataTable } from '../components/DataTable'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { Notice } from '../components/Notice'
import { PageHeader } from '../components/PageHeader'
import { useAsync } from '../hooks/useAsync'
import { deleteProduct, listProducts } from '../services/productService'
import type { Product } from '../types/product'
import { formatMoney } from '../utils/format'

export function ProductListPage() {
  // listProducts never changes, so it can be passed to useAsync directly.
  const { data: products, error, loading, reload } = useAsync(listProducts)
  const [toDelete, setToDelete] = useState<Product | null>(null)

  async function confirmDelete() {
    if (!toDelete) return
    await deleteProduct(toDelete.id) // on 409 the dialog shows the backend's message
    setToDelete(null)
    reload()
  }

  return (
    <>
      <PageHeader
        title="商品一覧"
        actions={
          <Link to="/products/new" className="button button-primary">
            登録
          </Link>
        }
      />
      <Notice />

      {loading && <Loading />}
      {!loading && error !== undefined && <ErrorMessage error={error} onRetry={reload} />}
      {products && (
        <DataTable
          columns={[
            { header: '商品コード', render: (p) => <Link to={`/products/${p.id}`}>{p.code}</Link> },
            { header: '商品名', render: (p) => p.name },
            { header: '商品価格', render: (p) => formatMoney(p.price), align: 'right' },
            { header: '数量', render: (p) => p.stock, align: 'right' },
            {
              header: '状態',
              align: 'right',
              render: (p) => (
                <div className="row-actions">
                  <Link to={`/products/${p.id}/edit`} className="button button-small">
                    編集
                  </Link>
                  <button type="button" className="button button-small button-danger" onClick={() => setToDelete(p)}>
                    削除
                  </button>
                </div>
              ),
            },
          ]}
          rows={products}
          rowKey={(p) => p.id}
          emptyMessage="商品はまだ登録されていません。"
          emptyAction={
            <Link to="/products/new" className="button button-primary">
              最初の商品を登録
            </Link>
          }
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="商品を削除しますか？"
        message={`「${toDelete?.name ?? ''}」を完全に削除します。売上に含まれる商品は削除できません。`}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
