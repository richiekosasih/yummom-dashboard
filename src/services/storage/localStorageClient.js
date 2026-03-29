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

export const localStorageClient = {
  read,
  write,
}
