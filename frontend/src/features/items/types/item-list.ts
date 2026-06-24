export interface ItemListRecord {
  id: number
  code: string
  name: string
  generic_name: string
  behaviour: string
  group_code: string
  status: "active" | "inactive"
  tax_status: "taxable" | "non_taxable"
  manufacturer: string
  updated_at: string
}
