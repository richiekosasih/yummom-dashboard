export function sortInventoryByName(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}
