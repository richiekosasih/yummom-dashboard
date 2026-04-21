import { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatIDR } from '../utils/currency'
import { formatDate } from '../utils/date'
import {
  getExpensesByMonth,
  getExpenseMonths,
  getMonthlySummary,
} from '../features/expenses/expenses.service'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatMonthLabel(year, month) {
  return `${MONTH_NAMES[month]} ${year}`
}

function getCategoryBadge(category) {
  switch (category) {
    case 'Raw Materials':
      return 'bg-amber-100 text-amber-700'
    case 'Packaging':
      return 'bg-blue-100 text-blue-700'
    case 'Operations':
      return 'bg-purple-100 text-purple-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function ExpensesPage() {
  const availableMonths = getExpenseMonths()

  const [selectedMonthKey, setSelectedMonthKey] = useState(
    availableMonths.length > 0
      ? `${availableMonths[0].year}-${availableMonths[0].month}`
      : '',
  )

  const [year, month] = selectedMonthKey.split('-').map(Number)
  const expenses = getExpensesByMonth(year, month)
  const summary = getMonthlySummary(year, month)

  return (
    <div className="space-y-6">
      {/* A. Page Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Expenses</h2>
          <p className="text-sm text-slate-600">
            Track operational costs and monthly spending for your business.
          </p>
        </div>
        <Button>+ Add Expense</Button>
      </header>

      {/* B. Month Selector */}
      <section className="flex items-center gap-3">
        <label
          htmlFor="month-selector"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Month
        </label>
        <select
          id="month-selector"
          value={selectedMonthKey}
          onChange={(event) => setSelectedMonthKey(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          {availableMonths.map(({ year: y, month: m }) => (
            <option key={`${y}-${m}`} value={`${y}-${m}`}>
              {formatMonthLabel(y, m)}
            </option>
          ))}
        </select>
      </section>

      {/* C. Monthly Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Expenses" subtitle="Spending this month">
          <p className="text-3xl font-bold text-slate-900">
            {formatIDR(summary.totalExpenses)}
          </p>
        </Card>
        <Card title="Total Entries" subtitle="Number of expense records">
          <p className="text-3xl font-bold text-slate-900">
            {summary.totalEntries}
          </p>
        </Card>
        <Card title="Biggest Category" subtitle="Highest total spending">
          <p className="text-3xl font-bold text-slate-900">
            {summary.biggestCategory}
          </p>
        </Card>
        <Card title="Average Expense" subtitle="Per entry this month">
          <p className="text-3xl font-bold text-slate-900">
            {formatIDR(summary.averageExpense)}
          </p>
        </Card>
      </section>

      {/* D. Expense Table */}
      <section>
        <Card
          title="Expense Records"
          subtitle={`Showing ${expenses.length} entries for ${formatMonthLabel(year, month)}`}
        >
          {expenses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="font-medium text-slate-700">
                No expenses recorded for this month.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add your first expense to start tracking costs.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Description</th>
                    <th className="py-2 pr-3 text-right">Amount</th>
                    <th className="py-2 pr-3">Payment</th>
                    <th className="py-2 pr-3">Notes</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 pr-3 font-mono text-xs text-slate-600">
                        {expense.id}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-3 text-slate-600">
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${getCategoryBadge(expense.category)}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 pr-3 font-medium text-slate-700">
                        {expense.description}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-3 text-right font-semibold text-slate-700">
                        {formatIDR(expense.amount)}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {expense.paymentMethod}
                      </td>
                      <td className="py-3 pr-3 text-slate-500">
                        {expense.notes || '-'}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="secondary"
                            className="px-2.5 py-1 text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            className="px-2.5 py-1 text-xs text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}

export default ExpensesPage
