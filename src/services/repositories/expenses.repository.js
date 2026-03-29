import { localStorageClient } from '../storage/localStorageClient'
import { STORAGE_KEYS } from '../storage/storageKeys'
import mockExpenses from '../../data/mockExpenses'

const KEY = STORAGE_KEYS.expenses

function getAll() {
  const items = localStorageClient.read(KEY, [])
  if (items.length > 0) return items
  localStorageClient.write(KEY, mockExpenses)
  return mockExpenses
}

function saveAll(items) {
  localStorageClient.write(KEY, items)
}

export const expensesRepository = {
  getAll,
  saveAll,
}
