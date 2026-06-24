export type QuotationStatus = "draft" | "confirmed" | "cancelled"

export type QuotationCurrency =
  | "SAR"
  | "AED"
  | "QAR"
  | "KWD"
  | "BHD"
  | "OMR"

export interface QuotationLine {
  id: number
  itemUnitId: number
  itemCode: string
  itemName: string
  description: string
  unit: string
  quantity: string
  rate: string
  discountPercentage: string
  discountAmount: string
  netAmount: string
  vatPercentage: string
  vatAmount: string
  netAfterVat: string
}

export interface QuotationForm {
  quotationDate: string
  customerId?: number
  customerCode: string
  customerName: string
  customerRefNo: string
  salesExecutive: string
  attention: string
  payTerms: string
  deliveryPlace: string
  currency: string
  exchangeRate: string
  notes: string
}
