import type { Product } from '../types/product'
import { toCents } from './format'

// One editable line of a new sale. Values are strings because they come from form inputs.
export interface SaleItemRow {
  key: number // stable React key, since rows can be removed from the middle
  productId: string
  quantity: string
}

let nextKey = 1
export function newSaleItemRow(): SaleItemRow {
  return { key: nextKey++, productId: '', quantity: '1' }
}

// Estimated line total in cents, or null if the row is incomplete.
// Only a preview: the backend calculates the real subtotal from the price at the time of sale.
export function estimateSubtotalCents(row: SaleItemRow, products: Product[]): number | null {
  const product = products.find((p) => String(p.id) === row.productId)
  const quantity = Number(row.quantity)
  if (!product || !Number.isInteger(quantity) || quantity <= 0) return null
  return toCents(product.price) * quantity
}
