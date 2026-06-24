export interface CreateSalesOrderLinePayload {
  item_unit_id: number
  quantity: string
  rate: string
  discount_percentage: string
}

export interface CreateSalesOrderPayload {
  quotation_id?: number
  customer_id: number
  sales_order_type: string
  issue_date: string
  valid_date: string | null
  customer_po: string
  sales_executive: string
  delivery_place: string
  currency: string
  exchange_rate: string
  notes: string
  lines: CreateSalesOrderLinePayload[]
}
