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
    navigate(`/products/${product.id}`, { state: { notice: '商品を登録しました。' } })
  }

  return (
    <>
      <PageHeader title="商品登録" />
      <ProductForm submitLabel="登録" onSubmit={handleSubmit} onCancel={() => navigate('/products')} />
    </>
  )
}
