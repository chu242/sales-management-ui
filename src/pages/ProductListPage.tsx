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
        title="Products"
        actions={
          <Link to="/products/new" className="button button-primary">
            New product
          </Link>
        }
      />
      <Notice />

      {loading && <Loading />}
      {!loading && error !== undefined && <ErrorMessage error={error} onRetry={reload} />}
      {products && (
        <DataTable
          columns={[
            { header: 'Name', render: (p) => <Link to={`/products/${p.id}`}>{p.name}</Link> },
            { header: 'Price', render: (p) => formatMoney(p.price), align: 'right' },
            { header: 'Stock', render: (p) => p.stock, align: 'right' },
            {
              header: 'Actions',
              align: 'right',
              render: (p) => (
                <div className="row-actions">
                  <Link to={`/products/${p.id}/edit`} className="button button-small">
                    Edit
                  </Link>
                  <button type="button" className="button button-small button-danger" onClick={() => setToDelete(p)}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          rows={products}
          rowKey={(p) => p.id}
          emptyMessage="No products yet."
          emptyAction={
            <Link to="/products/new" className="button button-primary">
              Create the first product
            </Link>
          }
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete product?"
        message={`"${toDelete?.name ?? ''}" will be permanently deleted. Products that appear in sales cannot be deleted.`}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
