// All environment configuration is read here, so the rest of the app never touches import.meta.env.
// Trailing slashes are removed so `${API_BASE_URL}/products` never becomes "//products".
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '')

// Products at or below this stock level are listed as "low stock" on the dashboard.
export const LOW_STOCK_THRESHOLD = 5
