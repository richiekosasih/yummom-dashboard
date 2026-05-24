import { localStorageClient } from '../storage/localStorageClient'
import { STORAGE_KEYS } from '../storage/storageKeys'
import products from '../../data/products'

const KEY = STORAGE_KEYS.products

function getAll() {
  const items = localStorageClient.read(KEY, null)
  if (Array.isArray(items)) return items
  localStorageClient.write(KEY, products)
  return products
}

function saveAll(items) {
  localStorageClient.write(KEY, items)
}

export const productsRepository = {
  getAll,
  saveAll,
}
