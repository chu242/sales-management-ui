import type { Product, ProductCreate, ProductUpdate } from '../types/product'
import { request } from './apiClient'

// One function per backend endpoint in python-api/app/routers/product_router.py.

export function listProducts(signal?: AbortSignal): Promise<Product[]> {
  return request<Product[]>('/products', { signal })
}

export function getProduct(id: number, signal?: AbortSignal): Promise<Product> {
  return request<Product>(`/products/${id}`, { signal })
}

export function createProduct(data: ProductCreate): Promise<Product> {
  return request<Product>('/products', { method: 'POST', body: data })
}

export function updateProduct(id: number, data: ProductUpdate): Promise<Product> {
  return request<Product>(`/products/${id}`, { method: 'PATCH', body: data })
}

// 409 if the product is used in existing sales.
export function deleteProduct(id: number): Promise<void> {
  return request<void>(`/products/${id}`, { method: 'DELETE' })
}
