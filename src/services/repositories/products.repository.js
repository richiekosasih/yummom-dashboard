import { localStorageClient } from '../storage/localStorageClient'
import { STORAGE_KEYS } from '../storage/storageKeys'
import mockProducts from '../../data/mockProducts'

const KEY = STORAGE_KEYS.products

function getAll() {
  const items = localStorageClient.read(KEY, [])
  if (items.length > 0) return items
  localStorageClient.write(KEY, mockProducts)
  return mockProducts
}

function saveAll(items) {
  localStorageClient.write(KEY, items)
}

export const productsRepository = {
  getAll,
  saveAll,
}
