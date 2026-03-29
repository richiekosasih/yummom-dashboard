export function sortProductsByName(products) {
  return [...products].sort((a, b) => a.name.localeCompare(b.name))
}
