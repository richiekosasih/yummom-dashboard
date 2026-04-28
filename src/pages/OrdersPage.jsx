import { useRef, useMemo, useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import {
  getAllCustomers,
  getOrders,
  getProductOptions,
} from '../features/orders/orders.service'
import {
  filterOrdersByCustomerName,
  sortOrdersNewestFirst,
} from '../features/orders/orders.logic'
import { ordersRepository } from '../services/repositories/orders.repository'
import { productsRepository } from '../services/repositories/products.repository'
import { deductStockFIFO, isBatchExpired } from '../features/products/products.logic'
import { generateNextId } from '../utils/id'
import { formatDate } from '../utils/date'
import { formatIDR } from '../utils/currency'

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  { value: 'in_progress', label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Unpaid', className: 'bg-red-100 text-red-700' },
  { value: 'paid', label: 'Paid', className: 'bg-emerald-100 text-emerald-700' },
]

const ORDER_STATUS_RANK = { pending: 0, in_progress: 1, completed: 2 }
const PAYMENT_STATUS_RANK = { unpaid: 0, paid: 1 }

const SORTABLE_COLUMNS = [
  { field: 'id', label: 'Order ID', align: 'left' },
  { field: 'customerName', label: 'Customer', align: 'left' },
  { field: 'orderDate', label: 'Order Date', align: 'left' },
  { field: 'dueDate', label: 'Due Date', align: 'left' },
  { field: 'orderStatus', label: 'Order Status', align: 'left' },
  { field: 'paymentStatus', label: 'Payment Status', align: 'left' },
  { field: 'total', label: 'Total', align: 'right' },
]

function compareOrders(a, b, field) {
  switch (field) {
    case 'total':
      return a.total - b.total
    case 'orderDate':
    case 'dueDate':
      return new Date(a[field]).getTime() - new Date(b[field]).getTime()
    case 'orderStatus':
      return (ORDER_STATUS_RANK[a.orderStatus] ?? 0) - (ORDER_STATUS_RANK[b.orderStatus] ?? 0)
    case 'paymentStatus':
      return (PAYMENT_STATUS_RANK[a.paymentStatus] ?? 0) - (PAYMENT_STATUS_RANK[b.paymentStatus] ?? 0)
    default:
      return String(a[field] ?? '').localeCompare(String(b[field] ?? ''))
  }
}

function getSortArrow(field, sortConfig) {
  if (sortConfig.field !== field) return ''
  return sortConfig.direction === 'asc' ? ' ▲' : ' ▼'
}

const TODAY = new Date().toISOString().slice(0, 10)

function OrdersPage({ initialAction }) {
  const formRef = useRef(null)
  const [orders, setOrders] = useState(() => getOrders())
  const [searchTerm, setSearchTerm] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    if (initialAction === 'showOrderForm') {
      setIsFormOpen(true)
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [initialAction])

  const [customers, setCustomers] = useState(() => getAllCustomers())
  const [customerMode, setCustomerMode] = useState('existing')
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerAddress, setNewCustomerAddress] = useState('')
  const [newCustomerNotes, setNewCustomerNotes] = useState('')

  const customerOptions = customers
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.id, name: c.name }))
  const productOptions = getProductOptions()

  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [draftOrderDate, setDraftOrderDate] = useState(TODAY)
  const [draftDueDate, setDraftDueDate] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' })

  const displayedOrders = useMemo(() => {
    const filtered = searchTerm.trim()
      ? filterOrdersByCustomerName(orders, searchTerm)
      : orders

    if (!sortConfig.field) return filtered

    const sorted = [...filtered].sort((a, b) => compareOrders(a, b, sortConfig.field))
    return sortConfig.direction === 'desc' ? sorted.reverse() : sorted
  }, [orders, searchTerm, sortConfig])

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null
  const selectedProduct =
    productOptions.find((product) => product.id === selectedProductId) || null
  const calculatedTotal = Number(quantity || 0) * Number(selectedProduct?.price || 0)

  function toggleForm() {
    const opening = !isFormOpen
    setIsFormOpen(opening)
    if (opening) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  function handleSort(field) {
    setSortConfig((prev) => {
      if (prev.field !== field) return { field, direction: 'asc' }
      if (prev.direction === 'asc') return { field, direction: 'desc' }
      return { field: null, direction: 'asc' }
    })
  }

  function updateOrderField(orderId, field, value) {
    setOrders((prev) => {
      const updated = prev.map((order) =>
        order.id === orderId ? { ...order, [field]: value } : order,
      )
      ordersRepository.saveAll(updated)
      return updated
    })
  }

  function handleDeleteOrder(order) {
    if (!window.confirm(`Delete order ${order.id}? This cannot be undone.`)) return
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== order.id)
      ordersRepository.saveAll(updated)
      return updated
    })
    setSuccessMessage(`Order ${order.id} deleted.`)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  function resetForm() {
    setSelectedCustomerId('')
    setSelectedProductId('')
    setQuantity('')
    setDraftOrderDate(TODAY)
    setDraftDueDate('')
    setFormErrors({})
    setCustomerMode('existing')
    setNewCustomerName('')
    setNewCustomerPhone('')
    setNewCustomerAddress('')
    setNewCustomerNotes('')
  }

  function generateNextCustomerId() {
    return generateNextId('CUST', customers)
  }

  function handleAddOrder() {
    const errors = {}

    if (customerMode === 'existing') {
      if (!selectedCustomerId) errors.customer = 'Please select a customer.'
    } else {
      if (!newCustomerName.trim()) errors.customerName = 'Customer name is required.'
      if (!newCustomerAddress.trim()) errors.customerAddress = 'Address is required.'
    }

    if (!selectedProductId) errors.product = 'Please select a product.'
    if (quantity < 1) errors.quantity = 'Quantity must be at least 1.'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const allProducts = productsRepository.getAll()
    const targetProduct = allProducts.find((p) => p.id === selectedProductId)
    if (!targetProduct) {
      setFormErrors({ product: 'Product not found.' })
      return
    }

    const currentBatches = Array.isArray(targetProduct.batches) ? targetProduct.batches : []
    const orderQty = Number(quantity) || 0
    const updatedBatches = deductStockFIFO(currentBatches, orderQty)
    if (!updatedBatches) {
      setFormErrors({
        quantity: 'Not enough non-expired stock available for this product.',
      })
      return
    }

    const updatedProducts = allProducts.map((p) => {
      if (p.id !== selectedProductId) return p
      const sellableStock = updatedBatches
        .filter((b) => !isBatchExpired(b.expiryDate))
        .reduce((sum, b) => sum + Number(b.quantity || 0), 0)
      return {
        ...p,
        batches: updatedBatches,
        totalStock: sellableStock,
      }
    })
    productsRepository.saveAll(updatedProducts)

    let customerId = selectedCustomerId
    let customerName = selectedCustomer?.name || 'Unknown Customer'

    if (customerMode === 'new') {
      const newId = generateNextCustomerId()
      const newCustomer = {
        id: newId,
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        address: newCustomerAddress.trim(),
        notes: newCustomerNotes.trim(),
        isActive: true,
      }
      setCustomers((prev) => [...prev, newCustomer])
      customerId = newId
      customerName = newCustomer.name
    }

    const newOrder = {
      id: generateNextId('ORD', orders),
      customerId,
      customerName,
      productId: selectedProductId,
      productName: targetProduct.name,
      quantity: orderQty,
      orderDate: draftOrderDate || TODAY,
      dueDate: draftDueDate || draftOrderDate || TODAY,
      orderStatus: 'pending',
      paymentStatus: 'unpaid',
      total: calculatedTotal,
    }

    setOrders((prev) => {
      const updated = sortOrdersNewestFirst([newOrder, ...prev])
      ordersRepository.saveAll(updated)
      return updated
    })
    resetForm()
    setIsFormOpen(false)

    setSuccessMessage(`Order ${newOrder.id} added successfully!`)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-sm text-slate-600">
            Track customer orders and monitor order status.
          </p>
        </div>
        <Button
          variant={isFormOpen ? 'secondary' : 'primary'}
          onClick={toggleForm}
        >
          {isFormOpen ? 'Close Form' : '+ Add New Order'}
        </Button>
      </header>

      <section className="max-w-md">
        <Input
          id="order-search"
          label="Search by customer name"
          placeholder="e.g. Reseller A"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </section>

      {successMessage ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {isFormOpen ? (
        <div ref={formRef}>
          <Card
            title="Add New Order"
            subtitle="Select customer, product, and dates — then save."
          >
            <div className="mb-4 space-y-3">
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">Customer Type</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomerMode('existing')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      customerMode === 'existing'
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Existing Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('new')}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      customerMode === 'new'
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    New Customer
                  </button>
                </div>
              </div>

              {customerMode === 'existing' ? (
                <div className="max-w-sm space-y-1">
                  <label htmlFor="mvp-order-customer" className="block text-sm font-medium text-slate-700">
                    Customer
                  </label>
                  <select
                    id="mvp-order-customer"
                    className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.customer ? 'border-red-400' : 'border-slate-300'}`}
                    value={selectedCustomerId}
                    onChange={(event) => {
                      setSelectedCustomerId(event.target.value)
                      setFormErrors((prev) => ({ ...prev, customer: undefined }))
                    }}
                  >
                    <option value="" disabled>
                      Select customer
                    </option>
                    {customerOptions.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.customer ? (
                    <p className="text-xs text-red-600">{formErrors.customer}</p>
                  ) : null}
                  {selectedCustomer ? (
                    <p className="mt-2 text-sm text-slate-600">
                      Delivery address: <span className="font-medium text-slate-700">{selectedCustomer.address}</span>
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Input
                      id="mvp-new-customer-name"
                      label="Customer Name *"
                      placeholder="e.g. Reseller D"
                      value={newCustomerName}
                      onChange={(e) => {
                        setNewCustomerName(e.target.value)
                        setFormErrors((prev) => ({ ...prev, customerName: undefined }))
                      }}
                    />
                    {formErrors.customerName ? (
                      <p className="text-xs text-red-600">{formErrors.customerName}</p>
                    ) : null}
                  </div>
                  <Input
                    id="mvp-new-customer-phone"
                    label="Phone"
                    placeholder="e.g. 0812-xxxx-xxxx"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                  />
                  <div className="space-y-1 md:col-span-2">
                    <Input
                      id="mvp-new-customer-address"
                      label="Address *"
                      placeholder="e.g. Jl. Merdeka No. 10, Jakarta"
                      value={newCustomerAddress}
                      onChange={(e) => {
                        setNewCustomerAddress(e.target.value)
                        setFormErrors((prev) => ({ ...prev, customerAddress: undefined }))
                      }}
                    />
                    {formErrors.customerAddress ? (
                      <p className="text-xs text-red-600">{formErrors.customerAddress}</p>
                    ) : null}
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      id="mvp-new-customer-notes"
                      label="Notes (optional)"
                      placeholder="e.g. Preferred delivery time"
                      value={newCustomerNotes}
                      onChange={(e) => setNewCustomerNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label htmlFor="mvp-order-product" className="block text-sm font-medium text-slate-700">
                  Product
                </label>
                <select
                  id="mvp-order-product"
                  className={`w-full rounded-md border px-3 py-2 text-sm ${formErrors.product ? 'border-red-400' : 'border-slate-300'}`}
                  value={selectedProductId}
                  onChange={(event) => {
                    setSelectedProductId(event.target.value)
                    setFormErrors((prev) => ({ ...prev, product: undefined }))
                  }}
                >
                  <option value="" disabled>
                    Select product
                  </option>
                  {productOptions.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                      disabled={product.totalStock <= 0}
                    >
                      {product.totalStock <= 0
                        ? `${product.name} — Out of sellable stock`
                        : `${product.name} — ${formatIDR(product.price)}/${product.unit} (Stock: ${product.totalStock})`}
                    </option>
                  ))}
                </select>
                {formErrors.product ? (
                  <p className="text-xs text-red-600">{formErrors.product}</p>
                ) : null}
              </div>
              <div className="space-y-1">
                <Input
                  id="mvp-order-qty"
                  label={`Quantity${selectedProduct ? ` (${selectedProduct.unit})` : ''}`}
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => {
                    setQuantity(event.target.value)
                    setFormErrors((prev) => ({ ...prev, quantity: undefined }))
                  }}
                />
                {formErrors.quantity ? (
                  <p className="text-xs text-red-600">{formErrors.quantity}</p>
                ) : null}
                {selectedProduct ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Available stock: <span className={`font-semibold ${selectedProduct.totalStock < quantity ? 'text-red-600' : 'text-emerald-600'}`}>{selectedProduct.totalStock} {selectedProduct.unit}</span>
                  </p>
                ) : null}
              </div>
              <Input
                id="mvp-order-date"
                label="Order Date"
                type="date"
                value={draftOrderDate}
                onChange={(event) => setDraftOrderDate(event.target.value)}
              />
              <Input
                id="mvp-due-date"
                label="Due Date"
                type="date"
                value={draftDueDate}
                onChange={(event) => setDraftDueDate(event.target.value)}
              />
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Estimated Total</p>
                {selectedProductId && quantity >= 1 ? (
                  <p className="font-semibold text-slate-800">{formatIDR(calculatedTotal)}</p>
                ) : (
                  <p className="font-medium text-slate-400">Waiting for input</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={handleAddOrder}>
                Save Order
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      <Card
        title="Order List"
        subtitle={
          sortConfig.field
            ? `${displayedOrders.length} order(s) — sorted by ${SORTABLE_COLUMNS.find((c) => c.field === sortConfig.field)?.label} (${sortConfig.direction === 'asc' ? 'A→Z / oldest' : 'Z→A / newest'})`
            : `${displayedOrders.length} order(s) — click a column header to sort`
        }
      >
        {displayedOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="font-medium text-slate-700">No orders found.</p>
            <p className="mt-1 text-sm text-slate-500">
              Try another search, or add a new order.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  {SORTABLE_COLUMNS.map((col) => (
                    <th
                      key={col.field}
                      className={`cursor-pointer select-none py-2 pr-3 transition-colors hover:text-slate-800 ${col.align === 'right' ? 'text-right' : ''}`}
                      onClick={() => handleSort(col.field)}
                    >
                      {col.label}{getSortArrow(col.field, sortConfig)}
                    </th>
                  ))}
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => {
                  const currentOrderStatus = ORDER_STATUS_OPTIONS.find(
                    (o) => o.value === order.orderStatus,
                  ) || ORDER_STATUS_OPTIONS[0]
                  const currentPaymentStatus = PAYMENT_STATUS_OPTIONS.find(
                    (o) => o.value === order.paymentStatus,
                  ) || PAYMENT_STATUS_OPTIONS[0]

                  return (
                    <tr key={order.id} className="border-b border-slate-100">
                      <td className="py-3 pr-3 font-mono text-xs text-slate-600">
                        {order.id}
                      </td>
                      <td className="py-3 pr-3 font-medium text-slate-700">
                        {order.customerName}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-3 text-slate-600">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-3 text-slate-600">
                        {formatDate(order.dueDate)}
                      </td>
                      <td className="py-3 pr-3">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderField(order.id, 'orderStatus', e.target.value)}
                          className={`cursor-pointer rounded-full border-none px-2 py-1 text-xs font-semibold outline-none ${currentOrderStatus.className}`}
                        >
                          {ORDER_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-3">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => updateOrderField(order.id, 'paymentStatus', e.target.value)}
                          className={`cursor-pointer rounded-full border-none px-2 py-1 text-xs font-semibold outline-none ${currentPaymentStatus.className}`}
                        >
                          {PAYMENT_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-700">
                        {formatIDR(order.total)}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                          onClick={() => handleDeleteOrder(order)}
                        >
                          Delete
                        </button>
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

export default OrdersPage
