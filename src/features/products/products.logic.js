export function sortProductsByName(products) {
  return [...products].sort((a, b) => a.name.localeCompare(b.name))
}

function normalizeBatches(productId, batches) {
  if (!Array.isArray(batches)) return []

  return batches.map((batch, index) => ({
    id: batch.id || `${productId}_batch_${index + 1}`,
    productionDate: batch.productionDate || null,
    expiryDate: batch.expiryDate || null,
    quantity: Number(batch.quantity || 0),
  }))
}

function getTotalStockFromBatches(batches) {
  return batches.reduce((total, batch) => total + Number(batch.quantity || 0), 0)
}

export function normalizeProducts(products) {
  return products.map((product) => {
    const batches = normalizeBatches(product.id, product.batches)

    return {
      id: product.id,
      name: product.name || 'Unnamed Product',
      price: Number(product.price || 0),
      unit: product.unit || 'pack',
      ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
      status: product.status || 'active',
      batches,
      totalStock: getTotalStockFromBatches(batches),
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

  const totalAvailable = sorted.reduce((sum, b) => sum + Number(b.quantity || 0), 0)
  if (totalAvailable < quantity) return null

  let remaining = quantity
  return sorted.map((batch) => {
    if (remaining <= 0) return batch
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
