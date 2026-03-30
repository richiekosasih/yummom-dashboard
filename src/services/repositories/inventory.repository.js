import { localStorageClient } from '../storage/localStorageClient'
import { STORAGE_KEYS } from '../storage/storageKeys'
import mockInventory from '../../data/mockInventory'

const KEY = STORAGE_KEYS.inventory

function isLegacyFinishedGoodsInventory(items) {
  return items.some((item) => Array.isArray(item.batches))
}

function getAll() {
  const items = localStorageClient.read(KEY, [])
  if (items.length > 0) {
    if (isLegacyFinishedGoodsInventory(items)) {
      localStorageClient.write(KEY, mockInventory)
      return mockInventory
    }
    return items
  }
  localStorageClient.write(KEY, mockInventory)
  return mockInventory
}

function saveAll(items) {
  localStorageClient.write(KEY, items)
}

export const inventoryRepository = {
  getAll,
  saveAll,
}
