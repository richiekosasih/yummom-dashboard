export function sortOrdersNewestFirst(orders) {
  return [...orders].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  )
}

export function normalizeOrders(orders) {
  return orders.map((order) => ({
    id: order.id,
    customerId: order.customerId || null,
    customerName: order.customerName || 'Unknown Customer',
    orderDate: order.orderDate || new Date().toISOString().slice(0, 10),
    dueDate: order.dueDate || order.orderDate || new Date().toISOString().slice(0, 10),
    status: order.status || 'pending',
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
