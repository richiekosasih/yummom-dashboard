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
 *
 * Batch IDs use product name initials: PN-00001, SB-00002, etc.
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

/**
 * Extract initials from a product name.
 * "Pork Nuggets" → "PN", "Chicken Katsu" → "CK"
 * Single-word names use the first two letters: "Risoles" → "RI"
 */
export function getProductInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'XX'
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

/**
 * Generate the next batch ID for a specific product.
 * Scans that product's existing batches to find the highest number.
 * Format: {initials}-00001, {initials}-00002, ...
 */
export function generateNextBatchIdForProduct(productName, batches) {
  const initials = getProductInitials(productName)
  const regex = new RegExp(`^${initials}-(\\d+)$`)
  let max = 0
  for (const batch of batches || []) {
    const match = batch.id?.match(regex)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > max) max = num
    }
  }
  return `${initials}-${String(max + 1).padStart(5, '0')}`
}
