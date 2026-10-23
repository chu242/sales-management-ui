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
  if (!name) errors.name = 'Name is required.'
  else if (name.length > 100) errors.name = 'Name must be at most 100 characters.'
  if (!PRICE_PATTERN.test(values.price.trim())) errors.price = 'Enter a price of 0 or more with at most 2 decimals, e.g. 12.50.'
  if (!/^\d+$/.test(values.stock.trim())) errors.stock = 'Stock must be a whole number of 0 or more.'
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

      <FormField id="product-name" label="Name" error={fieldErrors.name}>
        <input type="text" maxLength={100} autoComplete="off" autoFocus {...inputProps('name')} />
      </FormField>

      <FormField id="product-price" label="Price" error={fieldErrors.price}>
        <input type="text" inputMode="decimal" placeholder="0.00" {...inputProps('price')} />
      </FormField>

      <FormField id="product-stock" label="Stock" error={fieldErrors.stock}>
        <input type="number" min={0} step={1} {...inputProps('stock')} />
      </FormField>

      <div className="form-actions">
        <button type="button" className="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
