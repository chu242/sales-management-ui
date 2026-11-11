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

const NETWORK_ERROR = 'サーバーに接続できません。バックエンドが起動しているか確認してください。'

// The backend's messages are in English; known ones are shown in Japanese.
// Patterns match the messages raised in python-api/app/services/*.py and app/main.py.
const DETAIL_TRANSLATIONS: [RegExp, (...groups: string[]) => string][] = [
  [/^Product name '(.*)' already exists$/, (name) => `商品名「${name}」は既に登録されています。`],
  [/^Product (\d+) is used in existing sales and cannot be deleted$/, () => 'この商品は売上に含まれているため削除できません。'],
  [/^Product (\d+) not found$/, (id) => `商品（ID: ${id}）が見つかりません。`],
  [/^Sale (\d+) not found$/, (id) => `売上（ID: ${id}）が見つかりません。`],
  [
    /^Not enough stock for '(.*)': requested (\d+), available (\d+)$/,
    (name, requested, available) => `「${name}」の在庫が不足しています（注文数: ${requested}、在庫数: ${available}）。`,
  ],
  [/^Database error$/, () => 'データベースエラーが発生しました。'],
]

function translateDetail(detail: string): string {
  for (const [pattern, translate] of DETAIL_TRANSLATIONS) {
    const match = pattern.exec(detail)
    if (match) return translate(...match.slice(1))
  }
  return detail
}

// 422 messages come from Pydantic in English, so show a Japanese message per field instead.
function validationMessage(field: string, msg: string): string {
  if (field === 'name') return '商品名は1〜100文字で入力してください。'
  if (field === 'price') return '商品価格は0以上、小数点以下2桁までの数値で入力してください。'
  if (field === 'stock') return '数量は0以上の整数で入力してください。'
  if (/^items\.\d+\.product_id$/.test(field)) return '商品を選択してください。'
  if (/^items\.\d+\.quantity$/.test(field)) return '1以上の整数を入力してください。'
  if (field === 'items') {
    return msg.includes('only once') ? '同じ商品は1回だけ選択できます。数量をまとめてください。' : '商品を1つ以上追加してください。'
  }
  return '入力内容が正しくありません。'
}

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

  if (typeof detail === 'string') return new ApiError(status, translateDetail(detail))

  if (Array.isArray(detail)) {
    const fieldErrors: FieldErrors = {}
    for (const issue of detail as ValidationIssue[]) {
      // ["body", "items", 0, "quantity"] -> "items.0.quantity"; ["path", "product_id"] -> "product_id"
      const field = issue.loc.slice(1).join('.') || 'body'
      fieldErrors[field] ??= validationMessage(field, issue.msg)
    }
    const message = [...new Set(Object.values(fieldErrors))].join(' ')
    return new ApiError(status, message, fieldErrors)
  }

  // No JSON body: the Vite proxy answers like this when the backend is down.
  if (status >= 502 && status <= 504) return new ApiError(status, NETWORK_ERROR)
  if (status === 500 && data === null) return new ApiError(status, NETWORK_ERROR)
  return new ApiError(status, `リクエストに失敗しました（ステータス: ${status}）。`)
}

// Turns anything a request can throw into a message for the user.
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'エラーが発生しました。'
}
