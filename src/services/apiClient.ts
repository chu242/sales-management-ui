import { API_BASE_URL } from '../config'
import { ApiError, type FieldErrors } from '../types/api'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

// The two error formats FastAPI returns:
//   {"detail": "Product 5 not found"}                       (400, 404, 409, 500)
//   {"detail": [{"loc": ["body", "price"], "msg": "..."}]}  (422 validation)
interface ValidationIssue {
  loc: (string | number)[]
  msg: string
}

const NETWORK_ERROR = 'Cannot reach the server. Is the backend running?'

// One place for all HTTP calls: builds the URL, sends JSON, parses JSON,
// and converts every failure into an ApiError.
export async function request<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    // A cancelled request is not a failure: pass the AbortError through so callers can ignore it.
    if (signal?.aborted) throw error
    throw new ApiError(0, NETWORK_ERROR)
  }

  // 204 No Content (DELETE) has no body, so response.json() would throw.
  if (response.status === 204) return undefined as T

  const data = await readJson(response)
  if (!response.ok) throw toApiError(response.status, data)
  return data as T
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null // e.g. an HTML error page from a proxy
  }
}

function toApiError(status: number, data: unknown): ApiError {
  const detail = (data as { detail?: unknown } | null)?.detail

  if (typeof detail === 'string') return new ApiError(status, detail)

  if (Array.isArray(detail)) {
    const fieldErrors: FieldErrors = {}
    for (const issue of detail as ValidationIssue[]) {
      // ["body", "items", 0, "quantity"] -> "items.0.quantity"; ["path", "product_id"] -> "product_id"
      const field = issue.loc.slice(1).join('.') || 'body'
      fieldErrors[field] ??= issue.msg.replace(/^Value error, /, '')
    }
    const message = Object.entries(fieldErrors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join('; ')
    return new ApiError(status, message, fieldErrors)
  }

  // No JSON body: the Vite proxy answers like this when the backend is down.
  if (status >= 502 && status <= 504) return new ApiError(status, NETWORK_ERROR)
  if (status === 500 && data === null) return new ApiError(status, NETWORK_ERROR)
  return new ApiError(status, `Request failed with status ${status}`)
}

// Turns anything a request can throw into a message for the user.
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}
