export interface QuotationLine {
  localId: string
  itemUnitId?: number
  itemCode: string
  itemName: string
  description: string
  unit: string
  quantity: string
  rate: string
  defaultRate?: string
  discountPercentage: string
  discountAmount: string
  vatPercentage: string
  vatAmount: string
  netAmount: string
  netAfterVat: string
}

export interface ItemSearchResult {
  itemUnitId: number
  itemCode: string
  itemName: string
  description: string
  unit: string
  salePrice: string
  minimumSellingPrice: string
  vatPercentage: string
}
