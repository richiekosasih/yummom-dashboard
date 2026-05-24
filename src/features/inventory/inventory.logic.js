export function sortInventoryByName(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

const ALLOWED_UNITS = ['kg', 'pcs', 'pack', 'box']

function normalizeProductUnit(unit) {
  if (!unit) return 'pack'
  const normalizedUnit = String(unit).toLowerCase()
  return ALLOWED_UNITS.includes(normalizedUnit) ? normalizedUnit : 'pack'
}

function normalizeDateValue(value) {
  if (!value) return null
  return value
}

export function normalizeInventoryItems(items) {
  return items.map((item) => ({
    id: item.id,
    name: item.name || 'Unnamed Item',
    category: item.category || 'General',
    stock: Number(item.stock || 0),
    unit: normalizeProductUnit(item.unit),
    purchaseDate: normalizeDateValue(item.purchaseDate),
    expiryDate: normalizeDateValue(item.expiryDate),
  }))
}

export function getProductStockStatus(totalStock) {
  if (totalStock <= 10) {
    return {
      label: 'Low',
      badgeClass: 'bg-red-100 text-red-700',
    }
  }

  if (totalStock <= 25) {
    return {
      label: 'Medium',
      badgeClass: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    label: 'Good',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  }
}

export function searchInventoryItemsByName(items, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return items
  return items.filter((item) => item.name.toLowerCase().includes(normalizedKeyword))
}

export function isExpiringSoon(expiryDate, daysThreshold = 14) {
  const daysLeft = getDaysUntil(expiryDate)
  return daysLeft !== null && daysLeft >= 0 && daysLeft <= daysThreshold
}
import { getDaysUntil } from '../../utils/date'
