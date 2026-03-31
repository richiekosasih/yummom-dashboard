import { ordersRepository } from '../../services/repositories/orders.repository'
import customersData from '../../data/customersData'
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

export function getCustomerOptions() {
  return customersData
    .filter((customer) => customer.isActive)
    .map((customer) => ({ id: customer.id, name: customer.name }))
}
