// Mirrors the backend schemas in python-api/app/schemas/product_schema.py.
// Money is a string ("1.50") because the backend sends Decimal values as strings,
// which keeps them exact (a JavaScript number cannot store 0.1 exactly).

// ProductResponse
export interface Product {
  id: number
  name: string
  price: string
  stock: number
}

// ProductCreate (POST /products). stock defaults to 0 on the backend.
export interface ProductCreate {
  name: string
  price: string
  stock?: number
}

// ProductUpdate (PATCH /products/{id}): send only the fields that changed.
export type ProductUpdate = Partial<ProductCreate>
