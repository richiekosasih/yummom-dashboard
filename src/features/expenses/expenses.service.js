import { expensesRepository } from '../../services/repositories/expenses.repository'
import { sortExpensesByName } from './expenses.logic'

export function getExpenses() {
  return sortExpensesByName(expensesRepository.getAll())
}
