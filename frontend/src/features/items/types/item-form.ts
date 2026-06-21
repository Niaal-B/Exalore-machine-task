export type UnitRow = {
  id: number
  unit: string
  coFactor: string
  barcode: string
}

export type PriceRow = {
  id: number
  priceListType: string
  unit: string
  salePrice: string
  minimumPrice: string
}
