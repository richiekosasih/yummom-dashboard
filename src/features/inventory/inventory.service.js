import { inventoryRepository } from '../../services/repositories/inventory.repository'
import {
  normalizeInventoryItems,
  searchInventoryItemsByName,
  sortInventoryByName,
} from './inventory.logic'

export function getInventoryItems() {
  const items = inventoryRepository.getAll()
  return sortInventoryByName(normalizeInventoryItems(items))
}

export function searchInventoryItems(keyword) {
  return searchInventoryItemsByName(getInventoryItems(), keyword)
}
