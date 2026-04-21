export function sortExpensesByName(expenses) {
  return [...expenses].sort((a, b) => a.description.localeCompare(b.description))
}

export function sortExpensesByDateDesc(expenses) {
  return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function filterExpensesByMonth(expenses, year, month) {
  return expenses.filter((expense) => {
    const date = new Date(expense.date)
    return date.getFullYear() === year && date.getMonth() === month
  })
}

export function getMonthlyTotal(expenses) {
  return expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
}

export function getBiggestCategory(expenses) {
  if (expenses.length === 0) return '-'

  const totals = {}
  for (const expense of expenses) {
    totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount || 0)
  }

  let biggest = null
  let max = 0
  for (const [category, total] of Object.entries(totals)) {
    if (total > max) {
      biggest = category
      max = total
    }
  }

  return biggest || '-'
}

export function getAverageExpense(expenses) {
  if (expenses.length === 0) return 0
  return getMonthlyTotal(expenses) / expenses.length
}

export function getAvailableMonths(expenses) {
  const monthSet = new Set()
  for (const expense of expenses) {
    const date = new Date(expense.date)
    monthSet.add(`${date.getFullYear()}-${date.getMonth()}`)
  }

  return [...monthSet]
    .map((key) => {
      const [year, month] = key.split('-').map(Number)
      return { year, month }
    })
    .sort((a, b) => b.year - a.year || b.month - a.month)
}
