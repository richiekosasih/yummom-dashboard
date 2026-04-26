/**
 * Shared ID generator for the entire app.
 *
 * Format: PREFIX-001, PREFIX-002, ...
 * Scans existing items to find the highest number, then increments.
 *
 * Prefixes used:
 *   PRD   — Products
 *   ORD   — Orders
 *   CUST  — Customers
 *   INV   — Inventory items
 *   EXP   — Expenses
 *   BATCH — Production batches
 */
export function generateNextId(prefix, items) {
  const regex = new RegExp(`^${prefix}-(\\d+)$`)
  let max = 0
  for (const item of items) {
    const match = item.id?.match(regex)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > max) max = num
    }
  }
  return `${prefix}-${String(max + 1).padStart(3, '0')}`
}

export function generateNextBatchId(products) {
  const regex = /^BATCH-(\d+)$/
  let max = 0
  for (const product of products) {
    for (const batch of product.batches || []) {
      const match = batch.id?.match(regex)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > max) max = num
      }
    }
  }
  return `BATCH-${String(max + 1).padStart(3, '0')}`
}
