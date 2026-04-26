import { useRef, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { formatIDR } from '../utils/currency'
import { formatDate } from '../utils/date'
import { expensesRepository } from '../services/repositories/expenses.repository'
import {
  sortExpensesByDateDesc,
  filterExpensesByMonth,
  getMonthlyTotal,
  getBiggestCategory,
  getAverageExpense,
  getAvailableMonths,
} from '../features/expenses/expenses.logic'
import { generateNextId } from '../utils/id'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const CATEGORY_OPTIONS = ['Raw Materials', 'Packaging', 'Operations']
const PAYMENT_OPTIONS = ['Cash', 'Transfer']
const TODAY = new Date().toISOString().slice(0, 10)

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
  const formRef = useRef(null)
  const [allExpenses, setAllExpenses] = useState(() => expensesRepository.getAll())
  const [successMessage, setSuccessMessage] = useState('')

  const [formMode, setFormMode] = useState(null)
  const [selectedExpense, setSelectedExpense] = useState(null)

  const [draftDate, setDraftDate] = useState(TODAY)
  const [draftCategory, setDraftCategory] = useState(CATEGORY_OPTIONS[0])
  const [draftDescription, setDraftDescription] = useState('')
  const [draftAmount, setDraftAmount] = useState(0)
  const [draftPaymentMethod, setDraftPaymentMethod] = useState(PAYMENT_OPTIONS[0])
  const [draftNotes, setDraftNotes] = useState('')

  const availableMonths = getAvailableMonths(allExpenses)
  const [selectedMonthKey, setSelectedMonthKey] = useState(
    availableMonths.length > 0
      ? `${availableMonths[0].year}-${availableMonths[0].month}`
      : '',
  )

  const [year, month] = selectedMonthKey.split('-').map(Number)
  const expenses = sortExpensesByDateDesc(filterExpensesByMonth(allExpenses, year, month))
  const filtered = filterExpensesByMonth(allExpenses, year, month)
  const summary = {
    totalExpenses: getMonthlyTotal(filtered),
    totalEntries: filtered.length,
    biggestCategory: getBiggestCategory(filtered),
    averageExpense: getAverageExpense(filtered),
  }

  function scrollToForm() {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function showSuccess(message) {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  function persistExpenses(updated) {
    expensesRepository.saveAll(updated)
    setAllExpenses(updated)
  }

  function resetDraft() {
    setDraftDate(TODAY)
    setDraftCategory(CATEGORY_OPTIONS[0])
    setDraftDescription('')
    setDraftAmount(0)
    setDraftPaymentMethod(PAYMENT_OPTIONS[0])
    setDraftNotes('')
  }

  function openAddForm() {
    setFormMode('addExpense')
    setSelectedExpense(null)
    resetDraft()
    scrollToForm()
  }

  function openEditForm(expense) {
    setFormMode('editExpense')
    setSelectedExpense(expense)
    setDraftDate(expense.date)
    setDraftCategory(expense.category)
    setDraftDescription(expense.description)
    setDraftAmount(expense.amount)
    setDraftPaymentMethod(expense.paymentMethod)
    setDraftNotes(expense.notes || '')
    scrollToForm()
  }

  function closeForm() {
    setFormMode(null)
    setSelectedExpense(null)
  }

  function handleAddExpense() {
    if (!draftDescription.trim() || draftAmount <= 0) return
    const newExpense = {
      id: generateNextId('EXP', allExpenses),
      date: draftDate || TODAY,
      category: draftCategory,
      description: draftDescription.trim(),
      amount: Number(draftAmount),
      paymentMethod: draftPaymentMethod,
      notes: draftNotes.trim(),
    }
    persistExpenses([...allExpenses, newExpense])
    closeForm()

    const newDate = new Date(newExpense.date)
    const newMonthKey = `${newDate.getFullYear()}-${newDate.getMonth()}`
    setSelectedMonthKey(newMonthKey)

    showSuccess(`Expense "${newExpense.description}" added.`)
  }

  function handleEditExpense() {
    if (!selectedExpense || !draftDescription.trim()) return
    const updated = allExpenses.map((e) =>
      e.id === selectedExpense.id
        ? {
            ...e,
            date: draftDate || e.date,
            category: draftCategory,
            description: draftDescription.trim(),
            amount: Number(draftAmount) || e.amount,
            paymentMethod: draftPaymentMethod,
            notes: draftNotes.trim(),
          }
        : e,
    )
    persistExpenses(updated)
    closeForm()
    showSuccess(`Expense "${draftDescription.trim()}" updated.`)
  }

  function handleDeleteExpense(expense) {
    const confirmed = window.confirm(
      `Delete expense "${expense.description}" (${formatIDR(expense.amount)})?`,
    )
    if (!confirmed) return
    const updated = allExpenses.filter((e) => e.id !== expense.id)
    persistExpenses(updated)
    showSuccess(`Expense "${expense.description}" deleted.`)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Expenses</h2>
          <p className="text-sm text-slate-600">
            Track operational costs and monthly spending for your business.
          </p>
        </div>
        <Button onClick={openAddForm}>+ Add Expense</Button>
      </header>

      {successMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {formMode ? (
        <div ref={formRef}>
          <Card
            title={formMode === 'editExpense' ? 'Edit Expense' : 'Add Expense'}
            subtitle={
              formMode === 'editExpense'
                ? `Editing ${selectedExpense?.description}`
                : 'Fill in expense details.'
            }
          >
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                id="exp-date"
                label="Date"
                type="date"
                value={draftDate}
                onChange={(e) => setDraftDate(e.target.value)}
              />
              <div className="space-y-1">
                <label htmlFor="exp-category" className="block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  id="exp-category"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <Input
                id="exp-description"
                label="Description"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                placeholder="e.g. Pork purchase - 20kg"
              />
              <Input
                id="exp-amount"
                label="Amount (IDR)"
                type="number"
                min="0"
                value={draftAmount}
                onChange={(e) => setDraftAmount(Number(e.target.value || 0))}
              />
              <div className="space-y-1">
                <label htmlFor="exp-payment" className="block text-sm font-medium text-slate-700">
                  Payment Method
                </label>
                <select
                  id="exp-payment"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={draftPaymentMethod}
                  onChange={(e) => setDraftPaymentMethod(e.target.value)}
                >
                  {PAYMENT_OPTIONS.map((pm) => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>
              <Input
                id="exp-notes"
                label="Notes (optional)"
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="e.g. Supplier name"
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button onClick={formMode === 'editExpense' ? handleEditExpense : handleAddExpense}>
                {formMode === 'editExpense' ? 'Update Expense' : 'Add Expense'}
              </Button>
              <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            </div>
          </Card>
        </div>
      ) : null}

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
                            onClick={() => openEditForm(expense)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            className="px-2.5 py-1 text-xs text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteExpense(expense)}
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
