import Card from '../components/ui/Card'
import { getExpenses } from '../features/expenses/expenses.service'

function ExpensesPage() {
  const expenses = getExpenses()

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Expenses</h2>
        <p className="text-sm text-slate-600">
          Operational costs for your business.
        </p>
      </header>

      <Card title="Expense Items">
        <ul className="space-y-2 text-sm">
          {expenses.map((expense) => (
            <li key={expense.id} className="flex items-center justify-between">
              <span>{expense.name}</span>
              <span className="text-slate-500">{expense.amount}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export default ExpensesPage
