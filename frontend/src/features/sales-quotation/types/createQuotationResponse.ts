export interface CreateQuotationLineResponse {
  id: number
  line_no: number
  item_unit_id: number
  item_code: string
  item_name: string
  description: string
  unit: string
  quantity: string
  rate: string
  discount_percentage: string
  discount_amount: string
  vat_percentage: string
  vat_amount: string
  net_amount: string
  net_after_vat: string
}

export interface CreateQuotationResponse {
  id: number
  quotation_no: string
  quotation_date: string
  customer_id: number
  customer_code: string
  customer_name: string
  customer_ref_no: string
  sales_executive: string
  attention: string
  pay_terms: string
  delivery_place: string
  currency: string
  exchange_rate: string
  notes: string
  gross_amount: string
  discount_amount: string
  net_amount: string
  vat_amount: string
  net_after_vat: string
  status: "draft" | "confirmed" | "cancelled"
  lines: CreateQuotationLineResponse[]
  created_at: string
  updated_at: string
}
