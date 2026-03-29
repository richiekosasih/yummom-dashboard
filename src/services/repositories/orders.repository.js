import { localStorageClient } from '../storage/localStorageClient'
import { STORAGE_KEYS } from '../storage/storageKeys'
import mockOrders from '../../data/mockOrders'

const KEY = STORAGE_KEYS.orders

function getAll() {
  const items = localStorageClient.read(KEY, [])
  if (items.length > 0) return items
  localStorageClient.write(KEY, mockOrders)
  return mockOrders
}

function saveAll(items) {
  localStorageClient.write(KEY, items)
}

export const ordersRepository = {
  getAll,
  saveAll,
}
