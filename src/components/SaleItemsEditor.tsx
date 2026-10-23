import type { FieldErrors } from '../types/api'
import type { Product } from '../types/product'
import { formatCents, formatMoney } from '../utils/format'
import { estimateSubtotalCents, newSaleItemRow, type SaleItemRow } from '../utils/saleItems'

interface SaleItemsEditorProps {
  products: Product[]
  rows: SaleItemRow[]
  onChange: (rows: SaleItemRow[]) => void
  // Keys like "items.0.quantity", matching the backend's 422 error locations.
  errors: FieldErrors
  disabled?: boolean
}

// Rows of product + quantity for a new sale, with price, stock and an estimated subtotal per line.
export function SaleItemsEditor({ products, rows, onChange, errors, disabled }: SaleItemsEditorProps) {
  function update(index: number, changes: Partial<SaleItemRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...changes } : row)))
  }

  return (
    <div className="sale-items">
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th className="align-right">Unit price</th>
              <th className="align-right">In stock</th>
              <th>Quantity</th>
              <th className="align-right">Subtotal</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const product = products.find((p) => String(p.id) === row.productId)
              // A product may appear only once per sale (the backend rejects duplicates).
              const usedElsewhere = new Set(rows.filter((_, i) => i !== index).map((r) => r.productId))
              const subtotal = estimateSubtotalCents(row, products)
              const productError = errors[`items.${index}.product_id`]
              const quantityError = errors[`items.${index}.quantity`]

              return (
                <tr key={row.key}>
                  <td>
                    <select
                      aria-label={`Product for line ${index + 1}`}
                      value={row.productId}
                      onChange={(event) => update(index, { productId: event.target.value })}
                      aria-invalid={Boolean(productError)}
                      disabled={disabled}
                    >
                      <option value="">Select a product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={usedElsewhere.has(String(p.id)) || p.stock === 0}>
                          {p.name}
                          {p.stock === 0 ? ' (out of stock)' : ''}
                        </option>
                      ))}
                    </select>
                    {productError && <p className="field-error">{productError}</p>}
                  </td>
                  <td className="align-right">{product ? formatMoney(product.price) : '–'}</td>
                  <td className="align-right">{product ? product.stock : '–'}</td>
                  <td>
                    <input
                      type="number"
                      className="quantity-input"
                      aria-label={`Quantity for line ${index + 1}`}
                      min={1}
                      max={product?.stock}
                      step={1}
                      value={row.quantity}
                      onChange={(event) => update(index, { quantity: event.target.value })}
                      aria-invalid={Boolean(quantityError)}
                      disabled={disabled}
                    />
                    {quantityError && <p className="field-error">{quantityError}</p>}
                  </td>
                  <td className="align-right">{subtotal === null ? '–' : formatCents(subtotal)}</td>
                  <td className="align-right">
                    <button
                      type="button"
                      className="button button-small"
                      onClick={() => onChange(rows.filter((_, i) => i !== index))}
                      disabled={disabled || rows.length === 1}
                      aria-label={`Remove line ${index + 1}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="button"
        onClick={() => onChange([...rows, newSaleItemRow()])}
        disabled={disabled || rows.length >= products.length}
      >
        + Add product
      </button>
    </div>
  )
}
