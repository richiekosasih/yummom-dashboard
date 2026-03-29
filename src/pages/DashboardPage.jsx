import Card from '../components/ui/Card'
import { getDashboardSummary } from '../features/dashboard/dashboard.service'

function DashboardPage() {
  const summary = getDashboardSummary()

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-slate-600">
          Business overview from local data.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Total Orders">{summary.totalOrders}</Card>
        <Card title="Revenue (IDR)">{summary.revenue}</Card>
        <Card title="Expenses (IDR)">{summary.expenses}</Card>
      </div>
    </div>
  )
}

export default DashboardPage
