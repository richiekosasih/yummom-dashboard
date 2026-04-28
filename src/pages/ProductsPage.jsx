import { Fragment, useEffect, useRef, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { formatIDR } from '../utils/currency'
import { formatDate } from '../utils/date'
import { getBatchStatus } from '../features/products/products.logic'
import { getProducts } from '../features/products/products.service'
import { productsRepository } from '../services/repositories/products.repository'
import { generateNextId, generateNextBatchIdForProduct } from '../utils/id'

const UNIT_OPTIONS = ['pack', 'box', 'pcs', 'kg']
const STATUS_OPTIONS = ['active', 'draft']
const TODAY = new Date().toISOString().slice(0, 10)

function getProductStatusBadge(status) {
  if (status === 'draft') {
    return {
      label: 'Draft',
      className: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-700',
  }
}

function ProductsPage({ initialAction }) {
  const formRef = useRef(null)
  const [products, setProducts] = useState(() => getProducts())
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedProductId, setExpandedProductId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const [formMode, setFormMode] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [draftName, setDraftName] = useState('')
  const [draftPrice, setDraftPrice] = useState('')
  const [draftUnit, setDraftUnit] = useState(UNIT_OPTIONS[0])
  const [draftStatus, setDraftStatus] = useState(STATUS_OPTIONS[0])

  const [draftBatchProdDate, setDraftBatchProdDate] = useState(TODAY)
  const [draftBatchExpiryDate, setDraftBatchExpiryDate] = useState('')
  const [draftBatchQuantity, setDraftBatchQuantity] = useState('')

  const [editingBatchKey, setEditingBatchKey] = useState(null)
  const [editBatchProdDate, setEditBatchProdDate] = useState('')
  const [editBatchExpiryDate, setEditBatchExpiryDate] = useState('')
  const [editBatchQuantity, setEditBatchQuantity] = useState('')

  useEffect(() => {
    if (initialAction === 'showProductForm') {
      openAddForm()
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

  function resetBatchDraft() {
    setDraftBatchProdDate(TODAY)
    setDraftBatchExpiryDate('')
    setDraftBatchQuantity('')
  }

  function openAddForm() {
    setFormMode('addProduct')
    setSelectedProduct(null)
    setDraftName('')
    setDraftPrice('')
    setDraftUnit(UNIT_OPTIONS[0])
    setDraftStatus(STATUS_OPTIONS[0])
    resetBatchDraft()
    scrollToForm()
  }

  function openEditForm(product) {
    setFormMode('editProduct')
    setSelectedProduct(product)
    setDraftName(product.name)
    setDraftPrice(product.price)
    setDraftUnit(product.unit)
    setDraftStatus(product.status)
    scrollToForm()
  }

  function closeForm() {
    setFormMode(null)
    setSelectedProduct(null)
  }

  function persistProducts(updated) {
    const raw = updated.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      status: p.status,
      totalStock: p.totalStock,
      ingredients: p.ingredients || [],
      batches: p.batches || [],
    }))
    productsRepository.saveAll(raw)
    setProducts(getProducts())
  }

  function handleAddProduct() {
    if (!draftName.trim()) return
    const newId = generateNextId('PRD', products)
    const batches = []
    if (draftBatchQuantity > 0) {
      batches.push({
        id: generateNextBatchIdForProduct(draftName.trim(), []),
        productionDate: draftBatchProdDate || null,
        expiryDate: draftBatchExpiryDate || null,
        quantity: Number(draftBatchQuantity),
      })
    }
    const newProduct = {
      id: newId,
      name: draftName.trim(),
      price: Number(draftPrice) || 0,
      unit: draftUnit,
      status: draftStatus,
      totalStock: batches.reduce((sum, b) => sum + b.quantity, 0),
      ingredients: [],
      batches,
    }
    persistProducts([...products, newProduct])
    closeForm()
    showSuccess(`Product "${newProduct.name}" added.`)
  }

  function handleEditProduct() {
    if (!selectedProduct || !draftName.trim()) return
    const updated = products.map((p) =>
      p.id === selectedProduct.id
        ? {
            ...p,
            name: draftName.trim(),
            price: Number(draftPrice) || 0,
            unit: draftUnit,
            status: draftStatus,
          }
        : p,
    )
    persistProducts(updated)
    closeForm()
    showSuccess(`Product "${draftName.trim()}" updated.`)
  }

  function handleDeleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    const updated = products.filter((p) => p.id !== product.id)
    persistProducts(updated)
    if (selectedProduct?.id === product.id) closeForm()
    if (expandedProductId === product.id) setExpandedProductId(null)
    showSuccess(`Product "${product.name}" deleted.`)
  }

  function startEditBatch(productId, batch) {
    setEditingBatchKey(`${productId}:${batch.id}`)
    setEditBatchProdDate(batch.productionDate || '')
    setEditBatchExpiryDate(batch.expiryDate || '')
    setEditBatchQuantity(batch.quantity)
  }

  function cancelEditBatch() {
    setEditingBatchKey(null)
  }

  function handleSaveEditBatch(productId, batchId) {
    const updated = products.map((p) => {
      if (p.id !== productId) return p
      const updatedBatches = p.batches.map((b) => {
        if (b.id !== batchId) return b
        return {
          ...b,
          productionDate: editBatchProdDate || null,
          expiryDate: editBatchExpiryDate || null,
          quantity: Number(editBatchQuantity) || 0,
        }
      })
      return {
        ...p,
        batches: updatedBatches,
        totalStock: updatedBatches.reduce((sum, b) => sum + Number(b.quantity || 0), 0),
      }
    })
    persistProducts(updated)
    setEditingBatchKey(null)
    showSuccess(`Batch "${batchId}" updated.`)
  }

  function openAddBatchForm(product) {
    setFormMode('addBatch')
    setSelectedProduct(product)
    resetBatchDraft()
    scrollToForm()
  }

  function openGlobalBatchForm() {
    setFormMode('addBatch')
    setSelectedProduct(null)
    resetBatchDraft()
    scrollToForm()
  }

  function handleAddBatch() {
    if (!selectedProduct || draftBatchQuantity <= 0) return
    const newBatch = {
      id: generateNextBatchIdForProduct(selectedProduct.name, selectedProduct.batches || []),
      productionDate: draftBatchProdDate || null,
      expiryDate: draftBatchExpiryDate || null,
      quantity: Number(draftBatchQuantity),
    }
    const updated = products.map((p) => {
      if (p.id !== selectedProduct.id) return p
      const newBatches = [...(p.batches || []), newBatch]
      return {
        ...p,
        batches: newBatches,
        totalStock: newBatches.reduce((sum, b) => sum + Number(b.quantity || 0), 0),
      }
    })
    persistProducts(updated)
    closeForm()
    setExpandedProductId(selectedProduct.id)
    showSuccess(`Batch "${newBatch.id}" added to ${selectedProduct.name}.`)
  }

  const batchIdPreview = (() => {
    if (formMode === 'addBatch' && selectedProduct) {
      return generateNextBatchIdForProduct(selectedProduct.name, selectedProduct.batches || [])
    }
    if (formMode === 'addProduct' && draftName.trim()) {
      return generateNextBatchIdForProduct(draftName.trim(), [])
    }
    return ''
  })()

  const filteredProducts = searchTerm.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      )
    : products

  const totalProducts = filteredProducts.length
  const activeProducts = filteredProducts.filter((p) => p.status === 'active').length
  const totalStock = filteredProducts.reduce(
    (total, p) => total + Number(p.totalStock || 0),
    0,
  )
  const avgPrice =
    totalProducts > 0
      ? filteredProducts.reduce((total, p) => total + Number(p.price || 0), 0) / totalProducts
      : 0

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-slate-600">
            Finished frozen food products sold to customers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAddForm}>+ Add New Product</Button>
          <Button variant="secondary" onClick={openGlobalBatchForm}>+ Add Production Batch</Button>
        </div>
      </header>

      {successMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {formMode ? (
        <div ref={formRef}>
          <Card
            title={
              formMode === 'editProduct' ? 'Edit Product'
              : formMode === 'addBatch'
                ? selectedProduct ? `Add Production Batch — ${selectedProduct.name}` : 'Add Production Batch'
              : 'Add New Product'
            }
            subtitle={
              formMode === 'editProduct' ? `Editing ${selectedProduct?.name}`
              : formMode === 'addBatch' ? 'A production batch represents stock produced on a specific date with its own expiry date.'
              : 'Create a new item in the product catalog. You can optionally add the first production batch now.'
            }
          >
            {formMode !== 'addBatch' ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product Details
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                <Input
                  id="prd-name"
                  label="Product Name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g. Pork Nuggets"
                />
                <Input
                  id="prd-price"
                  label="Selling Price (IDR)"
                  type="number"
                  min="0"
                  value={draftPrice}
                  onChange={(e) => setDraftPrice(e.target.value)}
                />
                <div className="space-y-1">
                  <label htmlFor="prd-unit" className="block text-sm font-medium text-slate-700">
                    Unit
                  </label>
                  <select
                    id="prd-unit"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={draftUnit}
                    onChange={(e) => setDraftUnit(e.target.value)}
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="prd-status" className="block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    id="prd-status"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                </div>
              </div>
            ) : null}

            {formMode === 'addProduct' || formMode === 'addBatch' ? (
              <div className={formMode === 'addProduct' ? 'mt-5 border-t border-slate-200 pt-4' : ''}>
                {formMode === 'addProduct' ? (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Optional: Create First Production Batch
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      A batch tracks a specific production run — how many units were made, when, and when they expire.
                    </p>
                  </div>
                ) : null}
                {formMode === 'addBatch' ? (
                  <div className="mb-3 max-w-sm space-y-1">
                    <label htmlFor="batch-product" className="block text-sm font-medium text-slate-700">
                      Product
                    </label>
                    <select
                      id="batch-product"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={selectedProduct?.id || ''}
                      onChange={(e) => {
                        const product = products.find((p) => p.id === e.target.value) || null
                        setSelectedProduct(product)
                        resetBatchDraft()
                      }}
                    >
                      <option value="" disabled>Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Batch ID
                    </label>
                    <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-600">
                      {batchIdPreview || 'Auto-generated from product name'}
                    </div>
                  </div>
                  <Input
                    id="batch-quantity"
                    label="Quantity"
                    type="number"
                    min="0"
                    value={draftBatchQuantity}
                    onChange={(e) => setDraftBatchQuantity(e.target.value)}
                  />
                  <Input
                    id="batch-prod-date"
                    label="Production Date"
                    type="date"
                    value={draftBatchProdDate}
                    onChange={(e) => setDraftBatchProdDate(e.target.value)}
                  />
                  <Input
                    id="batch-expiry-date"
                    label="Expiry Date"
                    type="date"
                    value={draftBatchExpiryDate}
                    onChange={(e) => setDraftBatchExpiryDate(e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={
                formMode === 'editProduct' ? handleEditProduct
                : formMode === 'addBatch' ? handleAddBatch
                : handleAddProduct
              }>
                {formMode === 'editProduct' ? 'Update Product'
                  : formMode === 'addBatch' ? 'Save Production Batch'
                  : 'Save New Product'}
              </Button>
              <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            </div>
          </Card>
        </div>
      ) : null}

      <Card
        title="Finished Goods Catalog"
        subtitle="Product pricing and ingredient summary"
      >
        <div className="mb-4 max-w-sm">
          <Input
            id="product-search"
            label="Search Product"
            placeholder="Search by product name"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Products</p>
            <p className="font-semibold text-slate-800">{totalProducts}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-600">Active Products</p>
            <p className="font-semibold text-emerald-700">{activeProducts}</p>
          </div>
          <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm">
            <p className="text-xs uppercase tracking-wide text-blue-600">Total Stock</p>
            <p className="font-semibold text-blue-700">{totalStock}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm sm:col-span-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Average Price</p>
            <p className="font-semibold text-slate-800">{formatIDR(avgPrice)}</p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="font-medium text-slate-700">No products available yet.</p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first finished product to start selling.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Product ID</th>
                  <th className="py-2 pr-3">Product Name</th>
                  <th className="py-2 pr-3">Selling Price</th>
                  <th className="py-2 pr-3">Unit</th>
                  <th className="py-2 pr-3">Total Stock</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const status = getProductStatusBadge(product.status)
                  const isExpanded = expandedProductId === product.id

                  function toggleExpandedRow() {
                    if (isExpanded) {
                      setExpandedProductId(null)
                      return
                    }
                    setExpandedProductId(product.id)
                  }

                  return (
                    <Fragment key={product.id}>
                      <tr
                        className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                        onClick={toggleExpandedRow}
                      >
                        <td className="py-3 pr-3 font-mono text-xs text-slate-600">{product.id}</td>
                        <td className="py-3 pr-3 font-medium text-slate-700">
                          <span className="mr-2 inline-block w-3 text-slate-400">
                            {isExpanded ? '▾' : '▸'}
                          </span>
                          {product.name}
                        </td>
                        <td className="py-3 pr-3 text-slate-700">{formatIDR(product.price)}</td>
                        <td className="py-3 pr-3 text-slate-600">{product.unit}</td>
                        <td className="py-3 pr-3 text-slate-700">{product.totalStock}</td>
                        <td className="py-3 pr-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="secondary"
                              className="px-3 py-1.5 text-xs"
                              onClick={(event) => {
                                event.stopPropagation()
                                openEditForm(product)
                              }}
                            >
                              Edit
                            </Button>
                            <button
                              type="button"
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDeleteProduct(product)
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <td colSpan={7} className="px-3 py-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Production Batches
                            </p>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <th className="py-2 pr-3">Batch ID</th>
                                    <th className="py-2 pr-3">Production Date</th>
                                    <th className="py-2 pr-3">Expiry Date</th>
                                    <th className="py-2 pr-3">Quantity</th>
                                    <th className="py-2 pr-3">Batch Status</th>
                                    <th className="py-2 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.batches.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan={6}
                                        className="py-3 text-center text-sm text-slate-500"
                                      >
                                        No production batches yet.
                                      </td>
                                    </tr>
                                  ) : (
                                    product.batches.map((batch) => {
                                      const batchStatus = getBatchStatus(batch.expiryDate)
                                      const isEditing = editingBatchKey === `${product.id}:${batch.id}`

                                      if (isEditing) {
                                        return (
                                          <tr key={batch.id} className="border-b border-slate-200/70 bg-white">
                                            <td className="py-2 pr-3 font-mono text-xs text-slate-600">
                                              {batch.id}
                                            </td>
                                            <td className="py-2 pr-3">
                                              <input
                                                type="date"
                                                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                                                value={editBatchProdDate}
                                                onChange={(e) => setEditBatchProdDate(e.target.value)}
                                              />
                                            </td>
                                            <td className="py-2 pr-3">
                                              <input
                                                type="date"
                                                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                                                value={editBatchExpiryDate}
                                                onChange={(e) => setEditBatchExpiryDate(e.target.value)}
                                              />
                                            </td>
                                            <td className="py-2 pr-3">
                                              <input
                                                type="number"
                                                min="0"
                                                className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                                                value={editBatchQuantity}
                                                onChange={(e) => setEditBatchQuantity(e.target.value)}
                                              />
                                            </td>
                                            <td className="py-2 pr-3">
                                              <span
                                                className={`rounded-full px-2 py-1 text-xs font-semibold ${batchStatus.className}`}
                                              >
                                                {batchStatus.label}
                                              </span>
                                            </td>
                                            <td className="py-2 text-right">
                                              <div className="flex items-center justify-end gap-1">
                                                <button
                                                  type="button"
                                                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleSaveEditBatch(product.id, batch.id)
                                                  }}
                                                >
                                                  Save
                                                </button>
                                                <button
                                                  type="button"
                                                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    cancelEditBatch()
                                                  }}
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        )
                                      }

                                      return (
                                        <tr key={batch.id} className="border-b border-slate-200/70">
                                          <td className="py-2 pr-3 font-mono text-xs text-slate-600">
                                            {batch.id}
                                          </td>
                                          <td className="py-2 pr-3 text-slate-600">
                                            {batch.productionDate
                                              ? formatDate(batch.productionDate)
                                              : '-'}
                                          </td>
                                          <td className="py-2 pr-3 text-slate-600">
                                            {batch.expiryDate ? formatDate(batch.expiryDate) : '-'}
                                          </td>
                                          <td className="py-2 pr-3 text-slate-700">
                                            {batch.quantity} {product.unit}
                                          </td>
                                          <td className="py-2 pr-3">
                                            <span
                                              className={`rounded-full px-2 py-1 text-xs font-semibold ${batchStatus.className}`}
                                            >
                                              {batchStatus.label}
                                            </span>
                                          </td>
                                          <td className="py-2 text-right">
                                            <button
                                              type="button"
                                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                startEditBatch(product.id, batch)
                                              }}
                                            >
                                              Edit
                                            </button>
                                          </td>
                                        </tr>
                                      )
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                            <div className="mt-3">
                              <Button
                                variant="secondary"
                                className="px-3 py-1.5 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openAddBatchForm(product)
                                }}
                              >
                                + Add Production Batch
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
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

export default ProductsPage
