// Mirrors the backend schemas in python-api/app/schemas/sale_schema.py and sale_detail_schema.py.

// SaleDetailResponse: one line of a sale. unit_price is the price at the time of sale.
export interface SaleDetail {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: string
  subtotal: string
}

// SaleResponse. sale_date is UTC without a timezone suffix, e.g. "2026-10-23T06:37:23".
export interface Sale {
  id: number
  sale_date: string
  total_amount: string
  details: SaleDetail[]
}

// SaleDetailCreate: the client sends only product and quantity; the server sets the price.
export interface SaleItemCreate {
  product_id: number
  quantity: number
}

// SaleCreate (POST /sales): at least one item, each product at most once.
export interface SaleCreate {
  items: SaleItemCreate[]
}
