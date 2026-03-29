import Card from '../components/ui/Card'
import { getOrders } from '../features/orders/orders.service'

function OrdersPage() {
  const orders = getOrders()

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Orders</h2>
        <p className="text-sm text-slate-600">
          Sales and order tracking module.
        </p>
      </header>

      <Card title="Recent Orders">
        <ul className="space-y-2 text-sm">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between">
              <span>{order.customerName}</span>
              <span className="text-slate-500">{order.total}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export default OrdersPage
