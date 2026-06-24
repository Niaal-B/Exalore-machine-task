import { apiClient } from "@/lib/api-client"
import type { ItemSearchResult } from "@/features/sales-quotation/types/quotation-line"

type ItemSearchApiResult = {
  item_unit_id: number
  item_code: string
  item_name: string
  description: string
  unit: string
  sale_price: string
  minimum_selling_price: string
  vat_percentage: string
}

export async function searchItems(search: string): Promise<ItemSearchResult[]> {
  const response = await apiClient.get<ItemSearchApiResult[]>(
    "/api/items/search/",
    { params: { search: search.trim() } },
  )

  return response.data.map((item) => ({
    itemUnitId: item.item_unit_id,
    itemCode: item.item_code,
    itemName: item.item_name,
    description: item.description,
    unit: item.unit,
    salePrice: item.sale_price,
    minimumSellingPrice: item.minimum_selling_price,
    vatPercentage: item.vat_percentage,
  }))
}
