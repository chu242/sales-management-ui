import { useState, type FormEvent } from 'react'
import { ApiError, type FieldErrors } from '../types/api'
import type { Product } from '../types/product'
import { ErrorMessage } from './ErrorMessage'
import { FormField } from './FormField'

// Form inputs are always strings; the page converts them into the API request.
export interface ProductFormValues {
  name: string
  price: string
  stock: string
}

interface ProductFormProps {
  initial?: Product
  submitLabel: string
  // Should throw an ApiError on failure; field errors from the backend are shown next to the inputs.
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel: () => void
}

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/

// Same rules as the backend's ProductCreate schema, checked early for instant feedback.
// The backend still validates everything; this only saves a round trip.
function validate(values: ProductFormValues): FieldErrors {
  const errors: FieldErrors = {}
  const name = values.name.trim()
  if (!name) errors.name = '商品名を入力してください。'
  else if (name.length > 100) errors.name = '商品名は100文字以内で入力してください。'
  if (!PRICE_PATTERN.test(values.price.trim())) errors.price = '商品価格は0以上、小数点以下2桁までの数値で入力してください（例: 12.50）。'
  if (!/^\d+$/.test(values.stock.trim())) errors.stock = '数量は0以上の整数で入力してください。'
  return errors
}

// Used by both the create and the edit page.
export function ProductForm({ initial, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name ?? '',
    price: initial?.price ?? '',
    stock: String(initial?.stock ?? 0),
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<unknown>(null)
  const [submitting, setSubmitting] = useState(false)

  function change(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validate(values)
    setFieldErrors(errors)
    setSubmitError(null)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // e.g. "Product name 'Pen' already exists": belongs next to the name field.
        setFieldErrors({ name: error.message })
      } else if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setFieldErrors(error.fieldErrors)
      } else {
        setSubmitError(error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputProps = (field: keyof ProductFormValues) => ({
    id: `product-${field}`,
    value: values[field],
    onChange: (event: { target: { value: string } }) => change(field, event.target.value),
    'aria-invalid': Boolean(fieldErrors[field]),
    'aria-describedby': fieldErrors[field] ? `product-${field}-error` : undefined,
    disabled: submitting,
  })

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {submitError !== null && <ErrorMessage error={submitError} />}

      {initial && (
        <FormField id="product-code" label="商品コード">
          <input id="product-code" type="text" value={initial.code} readOnly />
        </FormField>
      )}

      <FormField id="product-name" label="商品名" error={fieldErrors.name}>
        <input type="text" maxLength={100} autoComplete="off" autoFocus {...inputProps('name')} />
      </FormField>

      <FormField id="product-price" label="商品価格" error={fieldErrors.price}>
        <input type="text" inputMode="decimal" placeholder="0.00" {...inputProps('price')} />
      </FormField>

      <FormField id="product-stock" label="数量" error={fieldErrors.stock}>
        <input type="number" min={0} step={1} {...inputProps('stock')} />
      </FormField>

      <div className="form-actions">
        <button type="button" className="button" onClick={onCancel} disabled={submitting}>
          キャンセル
        </button>
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? '保存中…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
