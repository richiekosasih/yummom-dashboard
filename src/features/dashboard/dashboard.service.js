import { getOrders } from '../orders/orders.service'
import { getExpenses } from '../expenses/expenses.service'

function sumBy(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0)
}

export function getDashboardSummary() {
  const orders = getOrders()
  const expenses = getExpenses()

  return {
    totalOrders: orders.length,
    revenue: sumBy(orders, 'total'),
    expenses: sumBy(expenses, 'amount'),
  }
}
