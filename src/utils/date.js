export function getTodayValue() {
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60 * 1000
  return new Date(today.getTime() - offset).toISOString().slice(0, 10)
}

export function parseDateValue(value) {
  if (!value) return null
  const [year, month, day] = String(value).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function getDaysUntil(value, fromValue = getTodayValue()) {
  const date = parseDateValue(value)
  const fromDate = parseDateValue(fromValue)
  if (!date || !fromDate) return null
  return Math.round((date.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(value) {
  const date = parseDateValue(value)
  return date ? date.toLocaleDateString('id-ID') : '-'
}
