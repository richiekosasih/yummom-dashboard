export const STORAGE_KEYS = {
  inventory: 'yummom_inventory',
  products: 'yummom_products',
  orders: 'yummom_orders',
  expenses: 'yummom_expenses',
  dataVersion: 'yummom_data_version',
}

/**
 * Bump this number whenever seed data or ID formats change.
 * On next load, old localStorage data is cleared and repositories
 * will automatically reseed from the updated source files.
 */
export const CURRENT_DATA_VERSION = 3
