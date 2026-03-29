import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatIDR } from '../utils/currency'
import { getDashboardData } from '../features/dashboard/dashboard.service'

function getStockContext(stock) {
  if (stock <= 5) {
    return {
      label: 'Critical',
      badgeClass: 'bg-red-100 text-red-700',
      note: 'Restock today',
    }
  }

  if (stock <= 10) {
    return {
      label: 'Low',
      badgeClass: 'bg-amber-100 text-amber-700',
      note: 'Plan restock this week',
    }
  }

  return {
    label: 'Healthy',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    note: 'Stock level is safe',
  }
}

function DashboardPage() {
  const dashboard = getDashboardData()
  const summaryCardMap = Object.fromEntries(
    dashboard.summaryCards.map((card) => [card.id, card]),
  )
  const totalOrders = summaryCardMap['total-orders']?.value ?? 0
  const lowStockCount = summaryCardMap['low-stock-items']?.value ?? 0
  const totalProducts = summaryCardMap['total-products']?.value ?? 0
  const estimatedProfit = summaryCardMap['estimated-profit']?.value ?? 0

  const recommendedActions = [
    {
      id: 'check-low-stock',
      title:
        lowStockCount > 0
          ? `Restock ${lowStockCount} low-stock item(s)`
          : 'No urgent stock refill needed',
      description:
        lowStockCount > 0
          ? 'Prioritize items marked low or critical to avoid missed orders.'
          : 'Inventory looks healthy. Keep monitoring daily.',
      toneClass:
        lowStockCount > 0
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
    {
      id: 'follow-up-orders',
      title: 'Review newest customer orders',
      description:
        'Confirm payment and shipment status so customers get updates quickly.',
      toneClass: 'border-slate-200 bg-slate-50 text-slate-700',
    },
    {
      id: 'check-profit',
      title: 'Check today’s profit trend',
      description:
        estimatedProfit < 0
          ? 'Current estimate is negative. Review expenses and pricing.'
          : 'Profit estimate is positive. Keep margins stable.',
      toneClass:
        estimatedProfit < 0
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Business Dashboard</h2>
          <p className="text-sm text-slate-600">
            Pantau order, stok, dan profit harian dalam satu halaman.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          Data Source: Mock Data
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-2">
        <Button size="lg">+ Add New Order</Button>
        <Button variant="secondary">+ Update Stock</Button>
        <Button variant="secondary">+ Add Product</Button>
        <span className="ml-0 text-xs text-slate-500 md:ml-2">
          Tip: Start with new orders, then update stock.
        </span>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Orders" subtitle="How many orders need handling">
          <p className="text-3xl font-bold text-slate-900">{totalOrders}</p>
          <p className="mt-1 text-xs text-slate-500">Action: review newest orders first.</p>
        </Card>
        <Card title="Low Stock Items" subtitle="Items that may run out soon">
          <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
          <p className="mt-1 text-xs text-slate-500">Action: refill items marked low/critical.</p>
        </Card>
        <Card title="Total Products" subtitle="Products currently listed">
          <p className="text-3xl font-bold text-slate-900">{totalProducts}</p>
          <p className="mt-1 text-xs text-slate-500">Action: keep best sellers always available.</p>
        </Card>
        <Card title="Estimated Profit" subtitle="Revenue minus current expenses">
          <p className="text-3xl font-bold text-emerald-700">{formatIDR(estimatedProfit)}</p>
          <p className="mt-1 text-xs text-slate-500">Action: check costs if margin drops.</p>
        </Card>
      </section>

      <section>
        <Card
          title="Recommended Actions Today"
          subtitle="Quick checklist for daily operations"
        >
          <ul className="space-y-2">
            {recommendedActions.map((action) => (
              <li
                key={action.id}
                className={`rounded-lg border px-3 py-2 ${action.toneClass}`}
              >
                <p className="text-sm font-semibold">{action.title}</p>
                <p className="text-xs">{action.description}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card
          title="Inventory Stock Table"
          subtitle="Clear stock status for restock decisions"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Item</th>
                  <th className="py-2">Current Stock</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.inventoryOverview.map((item) => {
                  const stockContext = getStockContext(item.stock)
                  return (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-slate-700">{item.name}</td>
                      <td className="py-3 text-slate-600">
                        {item.stock} {item.unit}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${stockContext.badgeClass}`}
                        >
                          {stockContext.label}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">{stockContext.note}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Recent Orders" subtitle="Latest transactions to follow up">
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

          <Card title="Low Stock Alerts" subtitle="Items that need urgent restock">
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
        <Card title="Cost Snapshot" subtitle="Simple cost health check">
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
