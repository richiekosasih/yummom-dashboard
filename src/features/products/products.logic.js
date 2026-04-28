import { getProductInitials } from '../../utils/id'

export function sortProductsByName(products) {
  return [...products].sort((a, b) => a.name.localeCompare(b.name))
}

function normalizeBatches(productName, batches) {
  if (!Array.isArray(batches)) return []

  const initials = getProductInitials(productName || 'XX')
  return batches.map((batch, index) => ({
    id: batch.id || `${initials}-${String(index + 1).padStart(5, '0')}`,
    productionDate: batch.productionDate || null,
    expiryDate: batch.expiryDate || null,
    quantity: Number(batch.quantity || 0),
  }))
}

export function isBatchExpired(expiryDate) {
  if (!expiryDate) return false
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return new Date(expiryDate) < now
}

function getSellableStock(batches) {
  return batches
    .filter((b) => !isBatchExpired(b.expiryDate))
    .reduce((total, b) => total + Number(b.quantity || 0), 0)
}

export function normalizeProducts(products) {
  return products.map((product) => {
    const batches = normalizeBatches(product.name, product.batches)

    return {
      id: product.id,
      name: product.name || 'Unnamed Product',
      price: Number(product.price || 0),
      unit: product.unit || 'pack',
      ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
      status: product.status || 'active',
      batches,
      totalStock: getSellableStock(batches),
    }
  })
}

export function searchProductsByName(products, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return products
  return products.filter((product) =>
    product.name.toLowerCase().includes(normalizedKeyword),
  )
}

export function deductStockFIFO(batches, quantity) {
  const sorted = [...batches].sort((a, b) => {
    const dateA = a.productionDate || a.expiryDate || '9999-12-31'
    const dateB = b.productionDate || b.expiryDate || '9999-12-31'
    return dateA.localeCompare(dateB)
  })

  const sellable = sorted.filter((b) => !isBatchExpired(b.expiryDate))
  const totalAvailable = sellable.reduce((sum, b) => sum + Number(b.quantity || 0), 0)
  if (totalAvailable < quantity) return null

  let remaining = quantity
  return sorted.map((batch) => {
    if (remaining <= 0 || isBatchExpired(batch.expiryDate)) return batch
    const deduct = Math.min(batch.quantity, remaining)
    remaining -= deduct
    return { ...batch, quantity: batch.quantity - deduct }
  })
}

export function getBatchStatus(expiryDate) {
  if (!expiryDate) {
    return {
      label: 'Unknown',
      className: 'bg-slate-100 text-slate-700',
    }
  }

  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return {
      label: 'Expired',
      className: 'bg-red-100 text-red-700',
    }
  }

  if (daysLeft <= 14) {
    return {
      label: 'Near Expiry',
      className: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    label: 'Good',
    className: 'bg-emerald-100 text-emerald-700',
  }
}
