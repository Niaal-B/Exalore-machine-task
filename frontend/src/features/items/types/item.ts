export type ItemBehaviour =
  | "stock"
  | "purchase"
  | "non_stock"
  | "service"
  | "assembly"

export type ItemStatus = "active" | "inactive"
export type TaxStatus = "taxable" | "non_taxable"

export type CreateItemPriceRequest = {
  price_list_type: string
  sale_price: string
  minimum_selling_price: string
}

export type CreateItemUnitRequest = {
  unit: string
  co_factor: string
  barcode: string | null
  prices: CreateItemPriceRequest[]
}

export type CreateItemRequest = {
  code: string
  name: string
  secondary_name: string
  generic_name: string
  description: string
  behaviour: ItemBehaviour
  group_code: string
  status: ItemStatus
  tax_status: TaxStatus
  shelf_code: string
  manufacturer: string
  image?: File | null
  units: CreateItemUnitRequest[]
}

export type ItemPriceResponse = CreateItemPriceRequest & {
  id: number
  item_unit: number
  created_at: string
  updated_at: string
}

export type ItemUnitResponse = Omit<CreateItemUnitRequest, "prices"> & {
  id: number
  prices: ItemPriceResponse[]
  created_at: string
  updated_at: string
}

export type ItemResponse = Omit<CreateItemRequest, "image" | "units"> & {
  id: number
  image: string | null
  units: ItemUnitResponse[]
  created_at: string
  updated_at: string
}
