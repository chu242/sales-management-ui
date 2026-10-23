import type { Sale, SaleCreate } from '../types/sale'
import { request } from './apiClient'

// One function per backend endpoint in python-api/app/routers/sale_router.py.
// The backend has no endpoints to edit or delete sales, or to change sale details on their own.

// Newest first, each sale with its details.
export function listSales(signal?: AbortSignal): Promise<Sale[]> {
  return request<Sale[]>('/sales', { signal })
}

export function getSale(id: number, signal?: AbortSignal): Promise<Sale> {
  return request<Sale>(`/sales/${id}`, { signal })
}

// 404 if a product does not exist, 400 if there is not enough stock.
// The whole sale is rejected in either case.
export function createSale(data: SaleCreate): Promise<Sale> {
  return request<Sale>('/sales', { method: 'POST', body: data })
}
