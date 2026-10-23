import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductCreatePage } from './pages/ProductCreatePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductEditPage } from './pages/ProductEditPage'
import { ProductListPage } from './pages/ProductListPage'
import { SaleCreatePage } from './pages/SaleCreatePage'
import { SaleDetailPage } from './pages/SaleDetailPage'
import { SaleListPage } from './pages/SaleListPage'

// Every screen has its own URL, so refresh, bookmarks and the back button work.
// There are no routes for editing sales: the backend does not support it.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/new" element={<ProductCreatePage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/:id/edit" element={<ProductEditPage />} />
        <Route path="sales" element={<SaleListPage />} />
        <Route path="sales/new" element={<SaleCreatePage />} />
        <Route path="sales/:id" element={<SaleDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
