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
    totalOrders: orders.length,
    totalRevenue,
    totalExpenses,
    totalProducts: products.length,
    lowStockCount: lowStockItems.length,
    estimatedProfit,
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
