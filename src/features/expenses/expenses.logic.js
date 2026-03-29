export function sortExpensesByName(expenses) {
  return [...expenses].sort((a, b) => a.name.localeCompare(b.name))
}
