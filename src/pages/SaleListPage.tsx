import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '../components/DataTable'
import { ErrorMessage } from '../components/ErrorMessage'
import { FormField } from '../components/FormField'
import { Loading } from '../components/Loading'
import { PageHeader } from '../components/PageHeader'
import { useAsync } from '../hooks/useAsync'
import { listSales } from '../services/saleService'
import type { Sale } from '../types/sale'
import { formatDateTime, formatMoney, toDateInputValue } from '../utils/format'

interface SaleSearch {
  date: string
  productName: string
}

const EMPTY_SEARCH: SaleSearch = { date: '', productName: '' }

// The backend has no search parameters, so sales are filtered here.
// The date is compared in local time, matching the date shown in the table.
function matchesSearch(sale: Sale, { date, productName }: SaleSearch): boolean {
  if (date && toDateInputValue(sale.sale_date) !== date) return false
  const name = productName.trim().toLowerCase()
  return !name || sale.details.some((d) => d.product_name.toLowerCase().includes(name))
}

export function SaleListPage() {
  const { data: sales, error, loading, reload } = useAsync(listSales)
  const [values, setValues] = useState(EMPTY_SEARCH)
  // The conditions in use: only updated by the Search button, not while typing.
  const [search, setSearch] = useState(EMPTY_SEARCH)
  const isSearching = search.date !== '' || search.productName.trim() !== ''

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearch(values)
  }

  return (
    <>
      <PageHeader
        title="Sales"
        actions={
          <Link to="/sales/new" className="button button-primary">
            New sale
          </Link>
        }
      />

      <form className="search-form" onSubmit={handleSubmit}>
        <FormField id="search-date" label="Sales Date">
          <input
            id="search-date"
            type="date"
            value={values.date}
            onChange={(event) => setValues({ ...values, date: event.target.value })}
          />
        </FormField>
        <FormField id="search-product" label="Product Name">
          <input
            id="search-product"
            type="text"
            value={values.productName}
            onChange={(event) => setValues({ ...values, productName: event.target.value })}
          />
        </FormField>
        <button type="submit" className="button button-primary">
          Search
        </button>
      </form>

      {loading && <Loading />}
      {!loading && error !== undefined && <ErrorMessage error={error} onRetry={reload} />}
      {sales && (
        <DataTable
          columns={[
            { header: 'Sale Code', render: (s) => <Link to={`/sales/${s.id}`}>{s.code}</Link> },
            { header: 'Date', render: (s) => formatDateTime(s.sale_date) },
            { header: 'Products', render: (s) => s.details.map((d) => d.product_name).join(', ') },
            { header: 'Items', render: (s) => s.details.reduce((sum, d) => sum + d.quantity, 0), align: 'right' },
            { header: 'Total', render: (s) => formatMoney(s.total_amount), align: 'right' },
          ]}
          rows={sales.filter((sale) => matchesSearch(sale, search))}
          rowKey={(s) => s.id}
          emptyMessage={isSearching ? 'No sales match your search.' : 'No sales yet.'}
          emptyAction={
            isSearching ? undefined : (
              <Link to="/sales/new" className="button button-primary">
                Record the first sale
              </Link>
            )
          }
        />
      )}
    </>
  )
}
