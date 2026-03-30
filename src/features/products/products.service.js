import { productsRepository } from '../../services/repositories/products.repository'
import { normalizeProducts, sortProductsByName } from './products.logic'

export function getProducts() {
  return sortProductsByName(normalizeProducts(productsRepository.getAll()))
}
