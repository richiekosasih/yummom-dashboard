import { useEffect, useRef, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { formatDate } from '../utils/date'
import {
  getProductStockStatus,
  isExpiringSoon,
} from '../features/inventory/inventory.logic'
import { getInventoryItems } from '../features/inventory/inventory.service'
import { inventoryRepository } from '../services/repositories/inventory.repository'

const CATEGORY_OPTIONS = ['Raw Material', 'Packaging', 'Supply']
const UNIT_OPTIONS = ['kg', 'pcs', 'pack', 'box']
const TODAY = new Date().toISOString().slice(0, 10)

function generateNextInventoryId(items) {
  let max = 0
  for (const item of items) {
    const match = item.id?.match(/^INV-(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > max) max = num
    }
  }
  return `INV-${String(max + 1).padStart(3, '0')}`
}

function InventoryPage({ initialAction }) {
  const formRef = useRef(null)
  const [items, setItems] = useState(() => getInventoryItems())
  const [searchTerm, setSearchTerm] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formMode, setFormMode] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const [stockItemId, setStockItemId] = useState('')
  const [stockAmount, setStockAmount] = useState(0)

  const [draftName, setDraftName] = useState('')
  const [draftCategory, setDraftCategory] = useState(CATEGORY_OPTIONS[0])
  const [draftStock, setDraftStock] = useState(0)
  const [draftUnit, setDraftUnit] = useState(UNIT_OPTIONS[0])
  const [draftPurchaseDate, setDraftPurchaseDate] = useState(TODAY)
  const [draftExpiryDate, setDraftExpiryDate] = useState('')

  useEffect(() => {
    if (initialAction === 'showStockForm') {
      openAddStockForm()
    } else if (initialAction === 'showItemForm') {
      openAddItemForm()
    }
  }, [initialAction])

  function scrollToForm() {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function showSuccess(message) {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  function openAddStockForm() {
    setFormMode('addStock')
    setSelectedItem(null)
    setStockItemId('')
    setStockAmount(0)
    scrollToForm()
  }

  function openAddItemForm() {
    setFormMode('addItem')
    setSelectedItem(null)
    resetItemDraft()
    scrollToForm()
  }

  function openEditItemForm(item) {
    setFormMode('editItem')
    setSelectedItem(item)
    setDraftName(item.name)
    setDraftCategory(item.category)
    setDraftStock(item.stock)
    setDraftUnit(item.unit)
    setDraftPurchaseDate(item.purchaseDate || '')
    setDraftExpiryDate(item.expiryDate || '')
    scrollToForm()
  }

  function closeForm() {
    setFormMode(null)
    setSelectedItem(null)
  }

  function resetItemDraft() {
    setDraftName('')
    setDraftCategory(CATEGORY_OPTIONS[0])
    setDraftStock(0)
    setDraftUnit(UNIT_OPTIONS[0])
    setDraftPurchaseDate(TODAY)
    setDraftExpiryDate('')
  }

  function persistItems(updated) {
    const raw = updated.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      purchaseDate: item.purchaseDate || null,
      expiryDate: item.expiryDate || null,
    }))
    inventoryRepository.saveAll(raw)
    setItems(getInventoryItems())
  }

  function handleAddStock() {
    if (!stockItemId || stockAmount <= 0) return
    const updated = items.map((item) =>
      item.id === stockItemId
        ? { ...item, stock: item.stock + Number(stockAmount) }
        : item,
    )
    persistItems(updated)
    closeForm()
    const target = items.find((i) => i.id === stockItemId)
    showSuccess(`Added ${stockAmount} to ${target?.name || stockItemId}.`)
  }

  function handleAddItem() {
    if (!draftName.trim()) return
    const newItem = {
      id: generateNextInventoryId(items),
      name: draftName.trim(),
      category: draftCategory,
      stock: Number(draftStock) || 0,
      unit: draftUnit,
      purchaseDate: draftPurchaseDate || null,
      expiryDate: draftExpiryDate || null,
    }
    persistItems([...items, newItem])
    closeForm()
    showSuccess(`Item "${newItem.name}" added.`)
  }

  function handleEditItem() {
    if (!selectedItem || !draftName.trim()) return
    const updated = items.map((item) =>
      item.id === selectedItem.id
        ? {
            ...item,
            name: draftName.trim(),
            category: draftCategory,
            stock: Number(draftStock) || 0,
            unit: draftUnit,
            purchaseDate: draftPurchaseDate || null,
            expiryDate: draftExpiryDate || null,
          }
        : item,
    )
    persistItems(updated)
    closeForm()
    showSuccess(`Item "${draftName.trim()}" updated.`)
  }

  const filteredItems = searchTerm.trim()
    ? items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      )
    : items

  const totalItems = filteredItems.length
  const lowStockItems = filteredItems.filter((item) => item.stock <= 10).length
  const expiringItems = filteredItems.filter((item) => isExpiringSoon(item.expiryDate)).length

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
          <Button onClick={openAddStockForm}>+ Add Stock</Button>
          <Button variant="secondary" onClick={openAddItemForm}>+ Add New Item</Button>
        </div>
      </header>

      {successMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {formMode === 'addStock' ? (
        <div ref={formRef}>
          <Card title="Add Stock" subtitle="Increase the stock of an existing inventory item.">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label htmlFor="stock-item-select" className="block text-sm font-medium text-slate-700">
                  Select Item
                </label>
                <select
                  id="stock-item-select"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={stockItemId}
                  onChange={(e) => setStockItemId(e.target.value)}
                >
                  <option value="" disabled>Choose item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (current: {item.stock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>
              <Input
                id="stock-amount"
                label="Amount to Add"
                type="number"
                min="1"
                value={stockAmount}
                onChange={(e) => setStockAmount(Math.max(0, Number(e.target.value || 0)))}
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button onClick={handleAddStock}>Save</Button>
              <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            </div>
          </Card>
        </div>
      ) : null}

      {formMode === 'addItem' || formMode === 'editItem' ? (
        <div ref={formRef}>
          <Card
            title={formMode === 'editItem' ? 'Edit Inventory Item' : 'Add Inventory Item'}
            subtitle={formMode === 'editItem' ? `Editing ${selectedItem?.name}` : 'Fill in the details for the new item.'}
          >
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                id="inv-name"
                label="Item Name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g. Pork"
              />
              <div className="space-y-1">
                <label htmlFor="inv-category" className="block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  id="inv-category"
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
                id="inv-stock"
                label="Stock"
                type="number"
                min="0"
                value={draftStock}
                onChange={(e) => setDraftStock(Number(e.target.value || 0))}
              />
              <div className="space-y-1">
                <label htmlFor="inv-unit" className="block text-sm font-medium text-slate-700">
                  Unit
                </label>
                <select
                  id="inv-unit"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={draftUnit}
                  onChange={(e) => setDraftUnit(e.target.value)}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <Input
                id="inv-purchase-date"
                label="Purchase Date"
                type="date"
                value={draftPurchaseDate}
                onChange={(e) => setDraftPurchaseDate(e.target.value)}
              />
              <Input
                id="inv-expiry-date"
                label="Expiry Date (optional)"
                type="date"
                value={draftExpiryDate}
                onChange={(e) => setDraftExpiryDate(e.target.value)}
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button onClick={formMode === 'editItem' ? handleEditItem : handleAddItem}>
                {formMode === 'editItem' ? 'Update Item' : 'Add Item'}
              </Button>
              <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            </div>
          </Card>
        </div>
      ) : null}

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

        {filteredItems.length === 0 ? (
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
                {filteredItems.map((item) => {
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
                        <Button
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => openEditItemForm(item)}
                        >
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
