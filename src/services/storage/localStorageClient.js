import { STORAGE_KEYS, CURRENT_DATA_VERSION } from './storageKeys'

function read(key, fallbackValue = []) {
  try {
    const rawValue = window.localStorage.getItem(key)
    if (!rawValue) return fallbackValue
    return JSON.parse(rawValue)
  } catch (error) {
    return fallbackValue
  }
}

function write(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function migrateIfNeeded() {
  const stored = window.localStorage.getItem(STORAGE_KEYS.dataVersion)
  if (Number(stored) >= CURRENT_DATA_VERSION) return

  window.localStorage.removeItem(STORAGE_KEYS.products)
  window.localStorage.removeItem(STORAGE_KEYS.orders)
  window.localStorage.removeItem(STORAGE_KEYS.inventory)
  window.localStorage.removeItem(STORAGE_KEYS.expenses)
  window.localStorage.setItem(
    STORAGE_KEYS.dataVersion,
    String(CURRENT_DATA_VERSION),
  )
}

export const localStorageClient = {
  read,
  write,
  migrateIfNeeded,
}
