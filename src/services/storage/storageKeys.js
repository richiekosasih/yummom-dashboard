export const STORAGE_KEYS = {
  inventory: 'yummom_inventory',
  products: 'yummom_products',
  orders: 'yummom_orders',
  customers: 'yummom_customers',
  expenses: 'yummom_expenses',
  dataVersion: 'yummom_data_version',
}

/**
 * Stored data is preserved when this number changes. Add targeted
 * migrations in localStorageClient if a future schema needs one.
 */
export const CURRENT_DATA_VERSION = 3
