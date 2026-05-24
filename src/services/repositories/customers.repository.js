import { localStorageClient } from '../storage/localStorageClient'
import { STORAGE_KEYS } from '../storage/storageKeys'
import customersData from '../../data/customersData'

const KEY = STORAGE_KEYS.customers

function getAll() {
  const items = localStorageClient.read(KEY, null)
  if (Array.isArray(items)) return items
  localStorageClient.write(KEY, customersData)
  return customersData
}

function saveAll(items) {
  localStorageClient.write(KEY, items)
}

export const customersRepository = {
  getAll,
  saveAll,
}
