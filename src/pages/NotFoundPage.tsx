import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" />
      <EmptyState
        message="The page you are looking for does not exist."
        action={
          <Link to="/" className="button">
            Go to the dashboard
          </Link>
        }
      />
    </>
  )
}
