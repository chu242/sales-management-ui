import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { ProductForm, type ProductFormValues } from '../components/ProductForm'
import { createProduct } from '../services/productService'

export function ProductCreatePage() {
  const navigate = useNavigate()

  async function handleSubmit(values: ProductFormValues) {
    const product = await createProduct({
      name: values.name.trim(),
      price: values.price.trim(), // sent as a string so the decimal stays exact
      stock: Number(values.stock),
    })
    navigate(`/products/${product.id}`, { state: { notice: 'Product created.' } })
  }

  return (
    <>
      <PageHeader title="New product" />
      <ProductForm submitLabel="Create product" onSubmit={handleSubmit} onCancel={() => navigate('/products')} />
    </>
  )
}
