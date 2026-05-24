import { STORAGE_KEYS, CURRENT_DATA_VERSION } from './storageKeys'

function read(key, fallbackValue = []) {
  try {
    const rawValue = window.localStorage.getItem(key)
    if (!rawValue) return fallbackValue
    return JSON.parse(rawValue)
  } catch {
    return fallbackValue
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function migrateIfNeeded() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.dataVersion)
    if (Number(stored) >= CURRENT_DATA_VERSION) return

    window.localStorage.setItem(
      STORAGE_KEYS.dataVersion,
      String(CURRENT_DATA_VERSION),
    )
  } catch {
    // The dashboard can still run with repository seed data if storage is blocked.
  }
}

export const localStorageClient = {
  read,
  write,
  migrateIfNeeded,
}
