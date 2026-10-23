import { useParams } from 'react-router-dom'

// Reads ":id" from the URL. Returns null for anything that is not a positive whole number
// (e.g. /products/abc), so the page can show "not found" without calling the API.
export function useIdParam(): number | null {
  const { id } = useParams()
  const value = Number(id)
  return Number.isInteger(value) && value > 0 ? value : null
}
