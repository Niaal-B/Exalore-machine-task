export interface QuotationDetailLine {
  id: number
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

export interface QuotationDetail {
  id: number
  quotation_no: string
  quotation_date: string
  customer_id: number
  customer_code: string
  customer_name: string
  customer_ref_no: string
  sales_executive: string
  delivery_place: string
  currency: string
  exchange_rate: string
  notes: string
  status: "draft" | "confirmed" | "cancelled"
  lines: QuotationDetailLine[]
}
