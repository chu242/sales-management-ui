import { errorMessage } from '../services/apiClient'
import { ApiError } from '../types/api'

interface ErrorMessageProps {
  error: unknown
  onRetry?: () => void
}

// Shows any request error in one consistent style. The Retry button is hidden for
// 4xx errors (e.g. 404 not found), where sending the same request again cannot help.
export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const isClientError = error instanceof ApiError && error.status >= 400 && error.status < 500
  return (
    <div className="alert alert-error" role="alert">
      <span>{errorMessage(error)}</span>
      {onRetry && !isClientError && (
        <button type="button" className="button button-small" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
