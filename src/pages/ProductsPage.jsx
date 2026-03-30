import { Fragment, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { formatIDR } from '../utils/currency'
import { formatDate } from '../utils/date'
import { getBatchStatus } from '../features/products/products.logic'
import { getProducts, searchProducts } from '../features/products/products.service'

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

function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedProductId, setExpandedProductId] = useState(null)
  const products = searchTerm.trim() ? searchProducts(searchTerm) : getProducts()
  const totalProducts = products.length
  const activeProducts = products.filter((product) => product.status === 'active').length
  const totalStock = products.reduce(
    (total, product) => total + Number(product.totalStock || 0),
    0,
  )
  const avgPrice =
    totalProducts > 0
      ? products.reduce((total, product) => total + Number(product.price || 0), 0) /
        totalProducts
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
        <Button>+ Add Product</Button>
      </header>

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

        {products.length === 0 ? (
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
                {products.map((product) => {
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
                          <Button
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            onClick={(event) => event.stopPropagation()}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <td colSpan={7} className="px-3 py-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Batch Details
                            </p>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <th className="py-2 pr-3">Batch ID</th>
                                    <th className="py-2 pr-3">Production Date</th>
                                    <th className="py-2 pr-3">Expiry Date</th>
                                    <th className="py-2 pr-3">Quantity</th>
                                    <th className="py-2">Batch Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.batches.length === 0 ? (
                                    <tr>
                                      <td
                                        colSpan={5}
                                        className="py-3 text-center text-sm text-slate-500"
                                      >
                                        No batches available.
                                      </td>
                                    </tr>
                                  ) : (
                                    product.batches.map((batch) => {
                                      const batchStatus = getBatchStatus(batch.expiryDate)
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
                                          <td className="py-2">
                                            <span
                                              className={`rounded-full px-2 py-1 text-xs font-semibold ${batchStatus.className}`}
                                            >
                                              {batchStatus.label}
                                            </span>
                                          </td>
                                        </tr>
                                      )
                                    })
                                  )}
                                </tbody>
                              </table>
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
