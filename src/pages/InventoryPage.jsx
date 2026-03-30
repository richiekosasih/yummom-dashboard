import { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { formatDate } from '../utils/date'
import {
  getProductStockStatus,
  isExpiringSoon,
} from '../features/inventory/inventory.logic'
import {
  getInventoryItems,
  searchInventoryItems,
} from '../features/inventory/inventory.service'

function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const items = searchTerm.trim()
    ? searchInventoryItems(searchTerm)
    : getInventoryItems()
  const totalItems = items.length
  const lowStockItems = items.filter((item) => item.stock <= 10).length
  const expiringItems = items.filter((item) => isExpiringSoon(item.expiryDate)).length

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Inventory</h2>
          <p className="text-sm text-slate-600">
            Supporting stock items for production, packaging, and operations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button>+ Add Stock</Button>
          <Button variant="secondary">+ Add New Item</Button>
        </div>
      </header>

      <Card title="Inventory Items" subtitle="Raw materials, packaging, and supplies">
        <div className="mb-4 max-w-sm">
          <Input
            id="inventory-search"
            label="Search Inventory Item"
            placeholder="Search by item name"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Items</p>
            <p className="font-semibold text-slate-800">{totalItems}</p>
          </div>
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm">
            <p className="text-xs uppercase tracking-wide text-red-600">Low Stock</p>
            <p className="font-semibold text-red-700">{lowStockItems}</p>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm">
            <p className="text-xs uppercase tracking-wide text-amber-600">Expiring Soon</p>
            <p className="font-semibold text-amber-700">{expiringItems}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="font-medium text-slate-700">No inventory items found.</p>
            <p className="mt-1 text-sm text-slate-500">
              Try another keyword or add a new stock item.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Item Name</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Current Stock</th>
                  <th className="py-2 pr-3">Unit</th>
                  <th className="py-2 pr-3">Purchase Date</th>
                  <th className="py-2 pr-3">Expiry Date</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const status = getProductStockStatus(item.stock)
                  return (
                    <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-3 pr-3 font-medium text-slate-700">
                          {item.name}
                        </td>
                      <td className="py-3 pr-3 text-slate-600">{item.category}</td>
                      <td className="py-3 pr-3 text-slate-700">{item.stock}</td>
                      <td className="py-3 pr-3 text-slate-600">{item.unit}</td>
                      <td className="py-3 pr-3 text-slate-600">
                        {item.purchaseDate ? formatDate(item.purchaseDate) : '-'}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {item.expiryDate ? formatDate(item.expiryDate) : 'Not applicable'}
                      </td>
                      <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${status.badgeClass}`}
                          >
                            {status.label}
                          </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="secondary" className="px-3 py-1.5 text-xs">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default InventoryPage
