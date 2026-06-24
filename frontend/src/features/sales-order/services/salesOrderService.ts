import { apiClient } from "@/lib/api-client"
import type { CreateSalesOrderPayload } from "@/features/sales-order/types/createSalesOrderPayload"
import type { CreateSalesOrderResponse } from "@/features/sales-order/types/createSalesOrderResponse"

export async function createSalesOrder(
  payload: CreateSalesOrderPayload,
): Promise<CreateSalesOrderResponse> {
  const response = await apiClient.post<CreateSalesOrderResponse>(
    "/api/sales-orders/",
    payload,
  )
  return response.data
}
