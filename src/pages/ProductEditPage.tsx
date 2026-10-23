import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loading } from '../components/Loading'
import { PageHeader } from '../components/PageHeader'
import { ProductForm, type ProductFormValues } from '../components/ProductForm'
import { useAsync } from '../hooks/useAsync'
import { useIdParam } from '../hooks/useIdParam'
import { getProduct, updateProduct } from '../services/productService'
import type { Product, ProductUpdate } from '../types/product'
import { toCents } from '../utils/format'
import { NotFoundPage } from './NotFoundPage'

export function ProductEditPage() {
  const id = useIdParam()
  if (id === null) return <NotFoundPage />
  return <ProductEdit id={id} />
}

// PATCH semantics: send only the fields that actually changed.
function changedFields(product: Product, values: ProductFormValues): ProductUpdate {
  const changes: ProductUpdate = {}
  const name = values.name.trim()
  const price = values.price.trim()
  const stock = Number(values.stock)
  if (name !== product.name) changes.name = name
  if (toCents(price) !== toCents(product.price)) changes.price = price // "1.5" and "1.50" are the same price
  if (stock !== product.stock) changes.stock = stock
  return changes
}

function ProductEdit({ id }: { id: number }) {
  const navigate = useNavigate()
  const load = useCallback((signal: AbortSignal) => getProduct(id, signal), [id])
  const { data: product, error, loading, reload } = useAsync(load)

  if (loading) return <Loading />
  if (error !== undefined || !product) return <ErrorMessage error={error} onRetry={reload} />

  async function handleSubmit(values: ProductFormValues) {
    const changes = changedFields(product!, values)
    if (Object.keys(changes).length === 0) {
      navigate(`/products/${id}`, { state: { notice: 'Nothing changed.' } })
      return
    }
    await updateProduct(id, changes)
    navigate(`/products/${id}`, { state: { notice: 'Product updated.' } })
  }

  return (
    <>
      <PageHeader title={`Edit ${product.name}`} />
      <ProductForm initial={product} submitLabel="Save changes" onSubmit={handleSubmit} onCancel={() => navigate(`/products/${id}`)} />
    </>
  )
}
