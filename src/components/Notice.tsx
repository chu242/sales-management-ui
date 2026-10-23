import { useLocation } from 'react-router-dom'

// Success message passed from the previous page, e.g.
// navigate('/products', { state: { notice: 'Product deleted' } })
export function Notice() {
  const notice = (useLocation().state as { notice?: string } | null)?.notice
  if (!notice) return null
  return (
    <div className="alert alert-success" role="status">
      {notice}
    </div>
  )
}
