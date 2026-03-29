import { useEffect, useState } from 'react'

export function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const rawValue = window.localStorage.getItem(key)
      return rawValue ? JSON.parse(rawValue) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
