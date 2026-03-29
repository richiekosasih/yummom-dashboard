import { inventoryRepository } from '../../services/repositories/inventory.repository'
import { sortInventoryByName } from './inventory.logic'

export function getInventoryItems() {
  return sortInventoryByName(inventoryRepository.getAll())
}
