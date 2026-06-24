import { apiClient } from "@/lib/api-client"
import type { Customer } from "@/features/sales-quotation/types/customer"

type CustomerApiResponse = {
  id: number
  code: string
  name: string
}

type CustomerListResponse =
  | CustomerApiResponse[]
  | { results: CustomerApiResponse[] }

export async function searchCustomers(search: string): Promise<Customer[]> {
  const response = await apiClient.get<CustomerListResponse>("/api/customers/", {
    params: { search: search.trim() },
  })
  const customers = Array.isArray(response.data)
    ? response.data
    : response.data.results

  return customers.map((customer) => ({
    ...customer,
    attention: "",
    payTerms: "",
    deliveryPlace: "",
    currency: "SAR",
  }))
}
