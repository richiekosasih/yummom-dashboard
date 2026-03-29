import { calculateGrossProfit, calculateHpp } from './costing.formulas'

export function getCostingPreview(input) {
  const hpp = calculateHpp(input)
  const grossProfit = calculateGrossProfit({
    sellingPrice: input.sellingPrice,
    hpp,
  })

  return { hpp, grossProfit }
}
