import { useRef, useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import {
  getCustomerById,
  getCustomerOptions,
  getOrders,
  getProductOptions,
} from '../features/orders/orders.service'
import {
  filterOrdersByCustomerName,
  generateNextOrderId,
  sortOrdersNewestFirst,
} from '../features/orders/orders.logic'
import { formatDate } from '../utils/date'
import { formatIDR } from '../utils/currency'

function getOrderStatusBadge(orderStatus) {
  if (orderStatus === 'completed') {
    return { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' }
  }
  if (orderStatus === 'in_progress') {
    return { label: 'In Progress', className: 'bg-blue-100 text-blue-700' }
  }
  return { label: 'Pending', className: 'bg-amber-100 text-amber-700' }
}

function getPaymentStatusBadge(paymentStatus) {
  if (paymentStatus === 'paid') {
    return { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' }
  }
  return { label: 'Unpaid', className: 'bg-red-100 text-red-700' }
}

const TODAY = new Date().toISOString().slice(0, 10)

function OrdersPage() {
  const formRef = useRef(null)
  const [orders, setOrders] = useState(() => getOrders())
  const [searchTerm, setSearchTerm] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const customerOptions = getCustomerOptions()
  const productOptions = getProductOptions()

  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [draftOrderDate, setDraftOrderDate] = useState(TODAY)
  const [draftDueDate, setDraftDueDate] = useState('')
  const [formErrors, setFormErrors] = useState({})

  const displayedOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders
    return filterOrdersByCustomerName(orders, searchTerm)
  }, [orders, searchTerm])

  const selectedCustomer = getCustomerById(selectedCustomerId)
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

  function resetForm() {
    setSelectedCustomerId('')
    setSelectedProductId('')
    setQuantity(1)
    setDraftOrderDate(TODAY)
    setDraftDueDate('')
    setFormErrors({})
  }

  function handleAddOrder() {
    const errors = {}
    if (!selectedCustomerId) errors.customer = 'Please select a customer.'
    if (!selectedProductId) errors.product = 'Please select a product.'
    if (quantity < 1) errors.quantity = 'Quantity must be at least 1.'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const newOrder = {
      id: generateNextOrderId(orders),
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || 'Unknown Customer',
      orderDate: draftOrderDate || TODAY,
      dueDate: draftDueDate || draftOrderDate || TODAY,
      orderStatus: 'pending',
      paymentStatus: 'unpaid',
      total: calculatedTotal,
    }

    setOrders((prev) => sortOrdersNewestFirst([newOrder, ...prev]))
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
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
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
              </div>
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
                    <option key={product.id} value={product.id}>
                      {product.name} — {formatIDR(product.price)}/{product.unit}
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
                    setQuantity(Math.max(1, Number(event.target.value || 1)))
                    setFormErrors((prev) => ({ ...prev, quantity: undefined }))
                  }}
                />
                {formErrors.quantity ? (
                  <p className="text-xs text-red-600">{formErrors.quantity}</p>
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

            {selectedCustomer ? (
              <p className="mt-3 text-sm text-slate-600">
                Delivery address: <span className="font-medium text-slate-700">{selectedCustomer.address}</span>
              </p>
            ) : null}

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

      <Card title="Order List" subtitle={`${displayedOrders.length} order(s) — latest first`}>
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
                  <th className="py-2 pr-3">Order ID</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Order Date</th>
                  <th className="py-2 pr-3">Due Date</th>
                  <th className="py-2 pr-3">Order Status</th>
                  <th className="py-2 pr-3">Payment Status</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => {
                  const orderStatus = getOrderStatusBadge(order.orderStatus)
                  const paymentStatus = getPaymentStatusBadge(order.paymentStatus)

                  return (
                    <tr key={order.id} className="border-b border-slate-100">
                      <td className="py-3 pr-3 font-mono text-xs text-slate-600">
                        {order.id}
                      </td>
                      <td className="py-3 pr-3 font-medium text-slate-700">
                        {order.customerName}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {formatDate(order.dueDate)}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${orderStatus.className}`}
                        >
                          {orderStatus.label}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${paymentStatus.className}`}
                        >
                          {paymentStatus.label}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-700">
                        {formatIDR(order.total)}
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
