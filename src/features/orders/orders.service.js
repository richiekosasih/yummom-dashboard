import { ordersRepository } from '../../services/repositories/orders.repository'
import {
  filterOrdersByCustomerName,
  normalizeOrders,
  sortOrdersNewestFirst,
} from './orders.logic'

export function getOrders() {
  const orders = ordersRepository.getAll()
  return sortOrdersNewestFirst(normalizeOrders(orders))
}

export function searchOrdersByCustomerName(keyword) {
  return filterOrdersByCustomerName(getOrders(), keyword)
}
