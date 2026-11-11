import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="ページが見つかりません" />
      <EmptyState
        message="お探しのページは存在しません。"
        action={
          <Link to="/" className="button">
            ダッシュボードへ戻る
          </Link>
        }
      />
    </>
  )
}
