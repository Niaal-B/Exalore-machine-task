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

export async function getSalesOrder(
  id: number,
): Promise<CreateSalesOrderResponse> {
  const response = await apiClient.get<CreateSalesOrderResponse>(
    `/api/sales-orders/${id}/`,
  )
  return response.data
}

export async function updateSalesOrder(
  id: number,
  payload: CreateSalesOrderPayload,
): Promise<CreateSalesOrderResponse> {
  const response = await apiClient.patch<CreateSalesOrderResponse>(
    `/api/sales-orders/${id}/`,
    payload,
  )
  return response.data
}

export async function listSalesOrders(params: {
  search?: string
  status?: string
  currency?: string
  ordering?: string
}): Promise<CreateSalesOrderResponse[]> {
  const response = await apiClient.get<
    CreateSalesOrderResponse[] | { results: CreateSalesOrderResponse[] }
  >("/api/sales-orders/", { params })
  return Array.isArray(response.data) ? response.data : response.data.results
}
