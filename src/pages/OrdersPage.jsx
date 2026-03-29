import { useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { getOrders, searchOrdersByCustomerName } from '../features/orders/orders.service'
import { formatDate } from '../utils/date'
import { formatIDR } from '../utils/currency'

function getStatusBadgeClass(status) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'paid') return 'bg-blue-100 text-blue-700'
  if (status === 'shipped') return 'bg-purple-100 text-purple-700'
  return 'bg-amber-100 text-amber-700'
}

function getStatusLabel(status) {
  if (status === 'completed') return 'Completed'
  if (status === 'paid') return 'Paid'
  if (status === 'shipped') return 'Shipped'
  return 'Pending'
}

function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const orders = useMemo(() => {
    if (!searchTerm.trim()) return getOrders()
    return searchOrdersByCustomerName(searchTerm)
  }, [searchTerm])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-sm text-slate-600">
            Track customer orders and monitor order status.
          </p>
        </div>
        <Button>+ Add New Order</Button>
      </header>

      <section className="max-w-md">
        <Input
          id="order-search"
          label="Search by customer name"
          placeholder="e.g. Reseller A"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </section>

      <Card title="Order List" subtitle="Latest orders are shown first">
        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="font-medium text-slate-700">No orders found.</p>
            <p className="mt-1 text-sm text-slate-500">
              Try another search, or add a new order.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Order Date</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="py-3 pr-3 font-medium text-slate-700">
                      {order.customerName}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          order.status,
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-700">
                      {formatIDR(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default OrdersPage
