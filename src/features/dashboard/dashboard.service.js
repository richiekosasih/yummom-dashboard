import { getOrders } from '../orders/orders.service'
import { getExpenses } from '../expenses/expenses.service'
import { getProducts } from '../products/products.service'
import { getInventoryItems } from '../inventory/inventory.service'
import { getDaysUntil, getTodayValue } from '../../utils/date'

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

  const today = getTodayValue()
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

  const expiringBatches = []
  for (const product of products) {
    const batches = Array.isArray(product.batches) ? product.batches : []
    for (const batch of batches) {
      if (!batch.expiryDate || batch.quantity <= 0) continue
      const daysLeft = getDaysUntil(batch.expiryDate)
      if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 14) {
        expiringBatches.push({
          productName: product.name,
          batchId: batch.id,
          expiryDate: batch.expiryDate,
          quantity: batch.quantity,
          unit: product.unit || 'pack',
          daysLeft,
          suggestedAction: daysLeft <= 7 ? 'Prioritize sale' : 'Consider promo',
        })
      }
    }
  }
  expiringBatches.sort((a, b) => a.daysLeft - b.daysLeft)

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalExpenses,
    totalProducts: products.length,
    lowStockCount: lowStockItems.length,
    expiringBatchCount: expiringBatches.length,
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
    expiringBatches,
  }
}
