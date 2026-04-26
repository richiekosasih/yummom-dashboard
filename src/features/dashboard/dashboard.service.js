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

  const today = new Date().toISOString().slice(0, 10)
  const overdueOrders = orders.filter(
    (order) => order.dueDate < today && order.orderStatus !== 'completed',
  )

  const expensesByCategory = {}
  for (const exp of expenses) {
    const cat = exp.category || 'Uncategorized'
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(exp.amount || 0)
  }
  let biggestCatName = null
  let biggestCatAmount = 0
  for (const [cat, amount] of Object.entries(expensesByCategory)) {
    if (amount > biggestCatAmount) {
      biggestCatName = cat
      biggestCatAmount = amount
    }
  }

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalExpenses,
    totalProducts: products.length,
    lowStockCount: lowStockItems.length,
    estimatedProfit,
    overdueOrderCount: overdueOrders.length,
    biggestExpenseCategory: biggestCatName
      ? { name: biggestCatName, amount: biggestCatAmount }
      : null,
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
