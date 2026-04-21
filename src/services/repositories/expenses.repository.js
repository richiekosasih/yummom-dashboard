import { localStorageClient } from '../storage/localStorageClient'
import { STORAGE_KEYS } from '../storage/storageKeys'
import mockExpenses from '../../data/mockExpenses'

const KEY = STORAGE_KEYS.expenses

function isValidShape(items) {
  if (!Array.isArray(items) || items.length === 0) return false
  return typeof items[0].date === 'string' && typeof items[0].category === 'string'
}

function getAll() {
  const items = localStorageClient.read(KEY, [])
  if (isValidShape(items)) return items
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
