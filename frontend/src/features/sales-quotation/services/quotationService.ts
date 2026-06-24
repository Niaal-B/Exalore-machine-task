import { apiClient } from "@/lib/api-client"
import type { CreateQuotationPayload } from "@/features/sales-quotation/types/createQuotationPayload"
import type { CreateQuotationResponse } from "@/features/sales-quotation/types/createQuotationResponse"

export async function createQuotation(
  payload: CreateQuotationPayload,
): Promise<CreateQuotationResponse> {
  const response = await apiClient.post<CreateQuotationResponse>(
    "/api/quotations/",
    payload,
  )
  return response.data
}

export async function listQuotations(params: {
  search?: string
  status?: string
  currency?: string
  ordering?: string
}): Promise<CreateQuotationResponse[]> {
  const response = await apiClient.get<
    CreateQuotationResponse[] | { results: CreateQuotationResponse[] }
  >("/api/quotations/", { params })
  return Array.isArray(response.data) ? response.data : response.data.results
}
