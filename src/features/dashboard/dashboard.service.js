import { getOrders } from '../orders/orders.service'
import { getExpenses } from '../expenses/expenses.service'
import { getProducts } from '../products/products.service'
import { getInventoryItems } from '../inventory/inventory.service'

function sumBy(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0)
}

export function getDashboardData() {
  const orders = getOrders()
  const expenses = getExpenses()
  const products = getProducts()
  const inventoryItems = getInventoryItems()

  const lowStockThreshold = 10
  const lowStockItems = inventoryItems.filter(
    (item) => item.stock <= lowStockThreshold,
  )

  const totalRevenue = sumBy(orders, 'total')
  const totalExpenses = sumBy(expenses, 'amount')
  const estimatedProfit = totalRevenue - totalExpenses

  return {
    summaryCards: [
      { id: 'total-orders', label: 'Total Orders', value: orders.length },
      { id: 'total-revenue', label: 'Total Revenue', value: totalRevenue },
      { id: 'total-expenses', label: 'Total Expenses', value: totalExpenses },
      { id: 'total-products', label: 'Total Products', value: products.length },
      { id: 'low-stock-items', label: 'Low Stock Items', value: lowStockItems.length },
      { id: 'estimated-profit', label: 'Estimated Profit', value: estimatedProfit },
    ],
    recentOrders: orders.slice(0, 5),
    inventoryOverview: inventoryItems.map((item) => ({
      id: item.id,
      name: item.name,
      stock: item.stock,
      unit: item.unit || 'pack',
    })),
    lowStockAlerts: lowStockItems,
  }
}
