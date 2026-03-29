import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatIDR } from '../utils/currency'
import { getDashboardData } from '../features/dashboard/dashboard.service'

function DashboardPage() {
  const dashboard = getDashboardData()
  const summaryCardMap = Object.fromEntries(
    dashboard.summaryCards.map((card) => [card.id, card]),
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Yummom Dashboard</h2>
          <p className="text-sm text-slate-600">
            Quick view of your business performance using mock data.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          Status: MVP Frontend
        </div>
      </header>

      <section className="flex flex-wrap gap-2">
        {dashboard.actions.map((action) => (
          <Button key={action.id}>{action.label}</Button>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Orders">
          <p className="text-3xl font-bold text-slate-900">
            {summaryCardMap['total-orders']?.value ?? 0}
          </p>
          <p className="mt-1 text-xs text-emerald-600">+12% this month</p>
        </Card>
        <Card title="Low Stock Items">
          <p className="text-3xl font-bold text-red-600">
            {summaryCardMap['low-stock-items']?.value ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">Need restock attention</p>
        </Card>
        <Card title="Total Products">
          <p className="text-3xl font-bold text-slate-900">
            {summaryCardMap['total-products']?.value ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">Active in catalog</p>
        </Card>
        <Card title="Estimated Profit">
          <p className="text-3xl font-bold text-emerald-700">
            {formatIDR(summaryCardMap['estimated-profit']?.value ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Revenue - expenses</p>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card title="Inventory Stock Table">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Product</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.inventoryOverview.map((item) => {
                  const isLow = item.stock <= 10
                  return (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-slate-700">{item.name}</td>
                      <td className="py-3 text-slate-600">
                        {item.stock} {item.unit}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            isLow
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Recent Orders">
            <ul className="space-y-2 text-sm">
              {dashboard.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="font-medium text-slate-700">{order.customerName}</span>
                  <span className="text-slate-600">{formatIDR(order.total)}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Low Stock Alerts">
            {dashboard.lowStockAlerts.length === 0 ? (
              <p className="text-sm text-slate-600">No low stock alerts right now.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {dashboard.lowStockAlerts.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800"
                  >
                    <span>{item.name}</span>
                    <span>
                      {item.stock} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>

      <section>
        <Card title="HPP / Cost Snapshot">
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-slate-500">Target COGS</p>
              <p className="text-lg font-bold text-slate-800">42.0%</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-emerald-700">Current COGS</p>
              <p className="text-lg font-bold text-emerald-700">38.4%</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}

export default DashboardPage
