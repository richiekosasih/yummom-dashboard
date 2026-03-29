import mockInventory from '../../data/mockInventory'
import mockOrders from '../../data/mockOrders'
import mockProducts from '../../data/mockProducts'
import mockExpenses from '../../data/mockExpenses'

function sumBy(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0)
}

function normalizeInventoryItems(items) {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    stock: Number(item.stock || 0),
    unit: item.unit || 'unit',
  }))
}

export function getDashboardData() {
  const inventoryItems = normalizeInventoryItems(mockInventory)
  const orders = [...mockOrders]
  const products = [...mockProducts]
  const expenses = [...mockExpenses]

  const lowStockThreshold = 10
  const lowStockItems = inventoryItems.filter(
    (item) => item.stock <= lowStockThreshold,
  )

  const revenue = sumBy(orders, 'total')
  const totalExpenses = sumBy(expenses, 'amount')
  const estimatedProfit = revenue - totalExpenses

  return {
    actions: [
      { id: 'add-order', label: 'Add Order' },
      { id: 'add-stock', label: 'Add Stock' },
      { id: 'add-product', label: 'Add Product' },
    ],
    summaryCards: [
      { id: 'total-orders', label: 'Total Orders', value: orders.length },
      { id: 'low-stock-items', label: 'Low Stock Items', value: lowStockItems.length },
      { id: 'total-products', label: 'Total Products', value: products.length },
      { id: 'estimated-profit', label: 'Estimated Profit', value: estimatedProfit },
    ],
    recentOrders: orders.slice(0, 5),
    inventoryOverview: inventoryItems,
    lowStockAlerts: lowStockItems,
  }
}
