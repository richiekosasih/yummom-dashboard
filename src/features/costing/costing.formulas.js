export function calculateHpp({ ingredientCost = 0, packagingCost = 0, overhead = 0 }) {
  return Number(ingredientCost) + Number(packagingCost) + Number(overhead)
}

export function calculateGrossProfit({ sellingPrice = 0, hpp = 0 }) {
  return Number(sellingPrice) - Number(hpp)
}
