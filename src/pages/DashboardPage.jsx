import { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatIDR } from '../utils/currency'
import { formatDate } from '../utils/date'
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

function getOrderStatusContext(order) {
  const status = order.orderStatus || order.status || 'pending'

  if (status === 'completed') {
    return { label: 'Completed', badgeClass: 'bg-emerald-100 text-emerald-700' }
  }

  if (status === 'in_progress') {
    return { label: 'In Progress', badgeClass: 'bg-blue-100 text-blue-700' }
  }

  return { label: 'Pending', badgeClass: 'bg-amber-100 text-amber-700' }
}

function DashboardPage({ onNavigate }) {
  const [recentOrderSort, setRecentOrderSort] = useState('dueDate')
  const dashboard = getDashboardData()
  const {
    totalOrders,
    totalRevenue,
    totalExpenses,
    totalProducts,
    lowStockCount,
    estimatedProfit,
    overdueOrderCount,
    biggestExpenseCategory,
  } = dashboard

  const expenseRatio = totalRevenue > 0 ? totalExpenses / totalRevenue : null
  const expenseRatioContext = (() => {
    if (expenseRatio === null) return { label: 'N/A', bgClass: 'bg-slate-50', textClass: 'text-slate-600', boldClass: 'text-slate-700', badgeClass: 'bg-slate-100 text-slate-700', message: 'No revenue recorded yet.' }
    if (expenseRatio > 1) return { label: 'Critical', bgClass: 'bg-red-50', textClass: 'text-red-600', boldClass: 'text-red-700', badgeClass: 'bg-red-100 text-red-700', message: 'Spending more than you earn. Reduce costs immediately.' }
    if (expenseRatio > 0.5) return { label: 'Warning', bgClass: 'bg-amber-50', textClass: 'text-amber-600', boldClass: 'text-amber-700', badgeClass: 'bg-amber-100 text-amber-700', message: 'Expenses are eating into your margins. Review costs.' }
    return { label: 'Good', bgClass: 'bg-emerald-50', textClass: 'text-emerald-600', boldClass: 'text-emerald-700', badgeClass: 'bg-emerald-100 text-emerald-700', message: 'Expenses are well within revenue. Keep it up.' }
  })()

  const revenueVsExpenseInsight = (() => {
    if (totalRevenue === 0 && totalExpenses === 0) return null
    if (totalRevenue === 0) return 'No revenue yet, but expenses are accumulating.'
    if (totalExpenses === 0) return 'No expenses recorded. All revenue is profit.'
    if (totalExpenses > totalRevenue) {
      const multiplier = (totalExpenses / totalRevenue).toFixed(1)
      return `Expenses are ${multiplier}x higher than revenue.`
    }
    const coverage = (totalRevenue / totalExpenses).toFixed(1)
    return `Revenue covers expenses ${coverage}x over.`
  })()

  const lowStockNames = dashboard.lowStockAlerts
    .slice(0, 3)
    .map((i) => i.name)
    .join(', ')
  const lowStockSuffix = lowStockCount > 3 ? ` and ${lowStockCount - 3} more` : ''

  const actionItems = [
    lowStockCount > 0
      ? {
          id: 'check-low-stock',
          title: `Restock ${lowStockCount} low-stock item(s)`,
          description: `Priority: ${lowStockNames}${lowStockSuffix}.`,
          toneClass: 'border-amber-200 bg-amber-50 text-amber-800',
        }
      : null,
    overdueOrderCount > 0
      ? {
          id: 'follow-up-overdue',
          title: `Follow up on ${overdueOrderCount} overdue order(s)`,
          description: 'Delayed orders risk customer trust and repeat business. Update their status or contact customers.',
          toneClass: 'border-red-200 bg-red-50 text-red-700',
        }
      : null,
    estimatedProfit < 0
      ? {
          id: 'review-expenses',
          title: `Reduce loss of ${formatIDR(Math.abs(estimatedProfit))}`,
          description: `Expenses (${formatIDR(totalExpenses)}) exceed revenue (${formatIDR(totalRevenue)}).${
            biggestExpenseCategory
              ? ` Biggest category: ${biggestExpenseCategory.name} (${formatIDR(biggestExpenseCategory.amount)}).`
              : ''
          } Review pricing or cut costs.`,
          toneClass: 'border-red-200 bg-red-50 text-red-700',
        }
      : null,
  ].filter(Boolean)

  const recommendedActions =
    actionItems.length > 0
      ? actionItems
      : [
          {
            id: 'all-good',
            title: 'No urgent actions today',
            description: 'Stock is healthy, no overdue orders, and profit is positive. Keep it up!',
            toneClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
          },
        ]

  const normalizedOrders = dashboard.recentOrders.map((order) => ({
    ...order,
    dueDate: order.dueDate || order.orderDate,
    address: order.address || 'Address not set',
  }))

  const sortedRecentOrders = [...normalizedOrders].sort((a, b) => {
    if (recentOrderSort === 'total') return Number(b.total || 0) - Number(a.total || 0)

    return (
      new Date(a.dueDate || a.orderDate).getTime() -
      new Date(b.dueDate || b.orderDate).getTime()
    )
  })

  const recentOrders = sortedRecentOrders.slice(0, 5)

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
          Data Source: Local Storage
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-2">
        <Button size="lg" onClick={() => onNavigate('orders', 'showOrderForm')}>+ Add New Order</Button>
        <Button variant="secondary" onClick={() => onNavigate('inventory', 'showStockForm')}>+ Update Stock</Button>
        <Button variant="secondary" onClick={() => onNavigate('products', 'showProductForm')}>+ Add Product</Button>
        <span className="ml-0 text-xs text-slate-500 md:ml-2">
          Tip: Start with new orders, then update stock.
        </span>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Total Orders" subtitle="How many orders need handling">
          <p className="text-3xl font-bold text-slate-900">{totalOrders}</p>
          <p className="mt-1 text-xs text-slate-500">Action: review newest orders first.</p>
        </Card>
        <Card title="Total Revenue" subtitle="Sum of all order totals">
          <p className="text-3xl font-bold text-blue-700">{formatIDR(totalRevenue)}</p>
          <p className="mt-1 text-xs text-slate-500">From all recorded orders.</p>
        </Card>
        <Card title="Total Expenses" subtitle="Sum of all recorded expenses">
          <p className="text-3xl font-bold text-orange-600">{formatIDR(totalExpenses)}</p>
          <p className="mt-1 text-xs text-slate-500">Includes all expense categories.</p>
        </Card>
        <Card title="Total Products" subtitle="Products currently listed">
          <p className="text-3xl font-bold text-slate-900">{totalProducts}</p>
          <p className="mt-1 text-xs text-slate-500">Action: keep best sellers always available.</p>
        </Card>
        <Card title="Low Stock Items" subtitle="Items that may run out soon">
          <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
          {lowStockCount > 0 ? (
            <p className="mt-1 text-xs text-slate-600">
              {lowStockNames}{lowStockSuffix}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">All stock levels are healthy.</p>
          )}
        </Card>
        <Card title="Estimated Profit" subtitle="Revenue minus expenses">
          <p className={`text-3xl font-bold ${estimatedProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {formatIDR(estimatedProfit)}
          </p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
            estimatedProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {estimatedProfit >= 0 ? 'Profit' : 'Loss'}
          </span>
        </Card>
      </section>

      {overdueOrderCount > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-800">
            {overdueOrderCount} overdue order(s) need attention
          </p>
          <p className="mt-1 text-xs text-red-600">
            These orders are past their due date and not yet completed.
          </p>
        </div>
      ) : null}

      <section>
        <Card title="Recent Orders" subtitle="Orders to review and process first">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="recent-order-sort"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Sort by
              </label>
              <select
                id="recent-order-sort"
                value={recentOrderSort}
                onChange={(event) => setRecentOrderSort(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
              >
                <option value="dueDate">Due Date</option>
                <option value="total">Total Amount</option>
              </select>
            </div>
            <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => onNavigate('orders')}>
              View All Orders
            </Button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
              <p className="font-medium text-slate-700">No recent orders yet.</p>
              <p className="mt-1 text-sm text-slate-500">
                Add a new order to start tracking deliveries.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3">Customer Name</th>
                    <th className="py-2 pr-3">Due Date</th>
                    <th className="py-2 pr-3">Address</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const statusContext = getOrderStatusContext(order)
                    return (
                      <tr key={order.id} className="border-b border-slate-100">
                        <td className="py-3 pr-3 font-medium text-slate-700">
                          {order.customerName}
                        </td>
                        <td className="py-3 pr-3 text-slate-600">
                          {formatDate(order.dueDate)}
                        </td>
                        <td className="py-3 pr-3 text-slate-600">{order.address}</td>
                        <td className="py-3 pr-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${statusContext.badgeClass}`}
                          >
                            {statusContext.label}
                          </span>
                        </td>
                        <td className="py-3 text-right font-semibold text-slate-700">
                          {formatIDR(order.total)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      <section>
        <Card title="Expiring Soon Products" subtitle="Batches expiring within the next 14 days">
          {dashboard.expiringBatches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
              <p className="font-medium text-slate-700">No products expiring soon.</p>
              <p className="mt-1 text-sm text-slate-500">
                All batches have more than 14 days until expiry.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3">Product Name</th>
                    <th className="py-2 pr-3">Batch ID</th>
                    <th className="py-2 pr-3">Expiry Date</th>
                    <th className="py-2 pr-3">Quantity</th>
                    <th className="py-2">Suggested Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.expiringBatches.map((item) => {
                    const isUrgent = item.daysLeft <= 7
                    return (
                      <tr key={item.batchId} className="border-b border-slate-100">
                        <td className="py-3 pr-3 font-medium text-slate-700">
                          {item.productName}
                        </td>
                        <td className="py-3 pr-3 font-mono text-xs text-slate-600">
                          {item.batchId}
                        </td>
                        <td className="py-3 pr-3 text-slate-600">
                          {formatDate(item.expiryDate)}
                          <span className={`ml-2 text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
                            ({item.daysLeft}d left)
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-slate-700">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            isUrgent
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.suggestedAction}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
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

      <section>
        <Card title="Cost Snapshot" subtitle="Expense-to-revenue ratio from your data">
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-blue-600">Revenue</p>
              <p className="text-lg font-bold text-blue-700">{formatIDR(totalRevenue)}</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-3">
              <p className="text-orange-600">Expenses</p>
              <p className="text-lg font-bold text-orange-700">{formatIDR(totalExpenses)}</p>
              {biggestExpenseCategory ? (
                <p className="mt-1 text-xs text-orange-600">
                  Biggest: {biggestExpenseCategory.name} ({formatIDR(biggestExpenseCategory.amount)})
                </p>
              ) : null}
            </div>
            <div className={`rounded-lg p-3 ${expenseRatioContext.bgClass}`}>
              <div className="flex items-center gap-2">
                <p className={expenseRatioContext.textClass}>Expense Ratio</p>
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${expenseRatioContext.badgeClass}`}>
                  {expenseRatioContext.label}
                </span>
              </div>
              <p className={`text-lg font-bold ${expenseRatioContext.boldClass}`}>
                {expenseRatio !== null ? `${(expenseRatio * 100).toFixed(1)}%` : 'N/A'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {expenseRatioContext.message}
              </p>
            </div>
          </div>
          {revenueVsExpenseInsight ? (
            <p className="mt-3 text-xs text-slate-500">
              {revenueVsExpenseInsight}
            </p>
          ) : null}
        </Card>
      </section>
    </div>
  )
}

export default DashboardPage
