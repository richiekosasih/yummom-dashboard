import { ordersRepository } from '../../services/repositories/orders.repository'
import { sortOrdersNewestFirst } from './orders.logic'

export function getOrders() {
  return sortOrdersNewestFirst(ordersRepository.getAll())
}
