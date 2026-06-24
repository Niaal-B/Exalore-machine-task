export interface CreateQuotationLinePayload {
  item_unit_id: number
  quantity: string
  discount_percentage: string
  rate?: string
}

export interface CreateQuotationPayload {
  customer_id: number
  quotation_date: string
  customer_ref_no: string
  sales_executive: string
  attention: string
  pay_terms: string
  delivery_place: string
  currency: string
  exchange_rate: string
  notes: string
  lines: CreateQuotationLinePayload[]
}
