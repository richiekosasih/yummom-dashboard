import { productsRepository } from '../../services/repositories/products.repository'
import {
  normalizeProducts,
  searchProductsByName,
  sortProductsByName,
} from './products.logic'

export function getProducts() {
  return sortProductsByName(normalizeProducts(productsRepository.getAll()))
}

export function searchProducts(keyword) {
  return searchProductsByName(getProducts(), keyword)
}
