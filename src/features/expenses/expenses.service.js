import { expensesRepository } from '../../services/repositories/expenses.repository'
import {
  sortExpensesByDateDesc,
  filterExpensesByMonth,
  getMonthlyTotal,
  getBiggestCategory,
  getAverageExpense,
  getAvailableMonths,
} from './expenses.logic'

export function getExpenses() {
  return sortExpensesByDateDesc(expensesRepository.getAll())
}

export function getExpensesByMonth(year, month) {
  const all = expensesRepository.getAll()
  const filtered = filterExpensesByMonth(all, year, month)
  return sortExpensesByDateDesc(filtered)
}

export function getExpenseMonths() {
  return getAvailableMonths(expensesRepository.getAll())
}

export function getMonthlySummary(year, month) {
  const all = expensesRepository.getAll()
  const filtered = filterExpensesByMonth(all, year, month)

  return {
    totalExpenses: getMonthlyTotal(filtered),
    totalEntries: filtered.length,
    biggestCategory: getBiggestCategory(filtered),
    averageExpense: getAverageExpense(filtered),
  }
}
