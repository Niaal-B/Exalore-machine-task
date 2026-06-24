import { apiClient } from "@/lib/api-client"
import type { QuotationDetail } from "@/features/sales-order/types/quotation-detail"
import type { QuotationSearchResult } from "@/features/sales-order/types/quotation-search"

type QuotationSearchApiResult = {
  id: number
  quotation_no: string
  quotation_date: string
  delivery_place: string
  customer_ref_no: string
  customer_code: string
  customer_name: string
  sales_executive: string
  net_amount: string
}

type QuotationListResponse =
  | QuotationSearchApiResult[]
  | { results: QuotationSearchApiResult[] }

export async function searchQuotations(
  search: string,
): Promise<QuotationSearchResult[]> {
  const response = await apiClient.get<QuotationListResponse>(
    "/api/quotations/",
    { params: { search: search.trim() } },
  )
  const quotations = Array.isArray(response.data)
    ? response.data
    : response.data.results

  return quotations.map((quotation) => ({
    id: quotation.id,
    quotationNo: quotation.quotation_no,
    deliveryPlace: quotation.delivery_place,
    issueDate: quotation.quotation_date,
    customerRefNo: quotation.customer_ref_no,
    customerCode: quotation.customer_code,
    customerName: quotation.customer_name,
    salesExecutive: quotation.sales_executive,
    netAmount: quotation.net_amount,
  }))
}

export async function getQuotationDetail(id: number): Promise<QuotationDetail> {
  const response = await apiClient.get<QuotationDetail>(`/api/quotations/${id}/`)
  return response.data
}
