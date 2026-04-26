import { ordersRepository } from '../../services/repositories/orders.repository'
import customersData from '../../data/customersData'
import productsData from '../../data/productsData'
import {
  filterOrdersByCustomerName,
  normalizeOrders,
  sortOrdersNewestFirst,
} from './orders.logic'

function enrichOrdersWithCustomerData(orders) {
  const customersById = new Map(customersData.map((customer) => [customer.id, customer]))

  return orders.map((order) => {
    const customer = customersById.get(order.customerId)
    return {
      ...order,
      customerName: customer?.name || order.customerName || 'Unknown Customer',
    }
  })
}

export function getOrders() {
  const orders = ordersRepository.getAll()
  const normalizedOrders = normalizeOrders(orders)
  const enrichedOrders = enrichOrdersWithCustomerData(normalizedOrders)
  return sortOrdersNewestFirst(enrichedOrders)
}

export function searchOrdersByCustomerName(keyword) {
  return filterOrdersByCustomerName(getOrders(), keyword)
}

export function getAllCustomers() {
  return customersData
}

export function getProductOptions() {
  return productsData
    .filter((product) => product.status === 'active')
    .map((product) => ({
      id: product.id,
      name: product.name,
      unit: product.unit,
      price: Number(product.price || 0),
    }))
}
