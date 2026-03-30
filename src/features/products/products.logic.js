export function sortProductsByName(products) {
  return [...products].sort((a, b) => a.name.localeCompare(b.name))
}

export function normalizeProducts(products) {
  return products.map((product) => ({
    id: product.id,
    name: product.name || 'Unnamed Product',
    price: Number(product.price || 0),
    unit: product.unit || 'pack',
    ingredientSummary: product.ingredientSummary || '-',
  }))
}
