import { getTodayValue } from '../../utils/date'

export function sortOrdersNewestFirst(orders) {
  return [...orders].sort(
    (a, b) => String(b.orderDate).localeCompare(String(a.orderDate)),
  )
}

function normalizeLegacyOrderStatus(status) {
  if (status === 'completed') return 'completed'
  if (status === 'paid') return 'in_progress'
  if (status === 'shipped') return 'in_progress'
  return 'pending'
}

function normalizeLegacyPaymentStatus(status) {
  if (status === 'paid' || status === 'completed') return 'paid'
  return 'unpaid'
}

export function normalizeOrders(orders) {
  const today = getTodayValue()
  return orders.map((order) => ({
    ...order,
    id: order.id,
    customerId: order.customerId || null,
    customerName: order.customerName || 'Unknown Customer',
    orderDate: order.orderDate || today,
    dueDate: order.dueDate || order.orderDate || today,
    orderStatus:
      order.orderStatus || normalizeLegacyOrderStatus(order.status),
    paymentStatus:
      order.paymentStatus || normalizeLegacyPaymentStatus(order.status),
    total: Number(order.total || 0),
  }))
}

export function filterOrdersByCustomerName(orders, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return orders

  return orders.filter((order) =>
    order.customerName.toLowerCase().includes(normalizedKeyword),
  )
}
