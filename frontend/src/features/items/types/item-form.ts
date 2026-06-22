import type { CreateItemRequest } from "@/features/items/types/item"

export type ItemGeneralValues = Omit<
  CreateItemRequest,
  "image" | "units"
>

export type UnitRow = {
  id: number
  unit: string
  co_factor: string
  barcode: string
}

export type PriceRow = {
  id: number
  price_list_type: string
  unit: string
  sale_price: string
  minimum_selling_price: string
}
