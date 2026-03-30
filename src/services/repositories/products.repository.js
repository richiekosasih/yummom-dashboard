import { localStorageClient } from '../storage/localStorageClient'
import { STORAGE_KEYS } from '../storage/storageKeys'
import productsData from '../../data/productsData'

const KEY = STORAGE_KEYS.products

function needsBatchMigration(items) {
  return items.some((item) => !Array.isArray(item.batches))
}

function getAll() {
  const items = localStorageClient.read(KEY, [])
  if (items.length > 0) {
    if (needsBatchMigration(items)) {
      localStorageClient.write(KEY, productsData)
      return productsData
    }
    return items
  }
  localStorageClient.write(KEY, productsData)
  return productsData
}

function saveAll(items) {
  localStorageClient.write(KEY, items)
}

export const productsRepository = {
  getAll,
  saveAll,
}
