import { ordersRepository } from '../../services/repositories/orders.repository'
import { customersRepository } from '../../services/repositories/customers.repository'
import { productsRepository } from '../../services/repositories/products.repository'
import {
  filterOrdersByCustomerName,
  normalizeOrders,
  sortOrdersNewestFirst,
} from './orders.logic'
import { isBatchExpired } from '../products/products.logic'

function enrichOrdersWithCustomerData(orders) {
  const customersData = customersRepository.getAll()
  const customersById = new Map(customersData.map((customer) => [customer.id, customer]))

  return orders.map((order) => {
    const customer = customersById.get(order.customerId)
    return {
      ...order,
      customerName: customer?.name || order.customerName || 'Unknown Customer',
      address: order.address || customer?.address || 'Address not set',
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
  return customersRepository.getAll()
}

export function getProductOptions() {
  return productsRepository.getAll()
    .filter((product) => product.status === 'active')
    .map((product) => {
      const batches = Array.isArray(product.batches) ? product.batches : []
      const sellableStock = batches
        .filter((b) => !isBatchExpired(b.expiryDate))
        .reduce((sum, b) => sum + Number(b.quantity || 0), 0)
      return {
        id: product.id,
        name: product.name,
        unit: product.unit,
        price: Number(product.price || 0),
        totalStock: sellableStock,
      }
    })
}
