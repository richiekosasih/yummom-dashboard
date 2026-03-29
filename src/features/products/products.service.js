import { productsRepository } from '../../services/repositories/products.repository'
import { sortProductsByName } from './products.logic'

export function getProducts() {
  return sortProductsByName(productsRepository.getAll())
}
