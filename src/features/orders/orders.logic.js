export function sortOrdersNewestFirst(orders) {
  return [...orders].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
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
  return orders.map((order) => ({
    id: order.id,
    customerId: order.customerId || null,
    customerName: order.customerName || 'Unknown Customer',
    orderDate: order.orderDate || new Date().toISOString().slice(0, 10),
    dueDate: order.dueDate || order.orderDate || new Date().toISOString().slice(0, 10),
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

export function generateNextOrderId(existingOrders) {
  let max = 0
  for (const order of existingOrders) {
    const match = order.id?.match(/^ORD-(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > max) max = num
    }
  }
  return `ORD-${String(max + 1).padStart(3, '0')}`
}
