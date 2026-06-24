import axios from "axios"

import { apiClient } from "@/lib/api-client"
import type {
  CreateItemRequest,
  ItemResponse,
} from "@/features/items/types/item"
import type { ItemListRecord } from "@/features/items/types/item-list"

export type ItemApiError = {
  message: string
  fieldErrors: Record<string, string>
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function flattenErrors(
  value: unknown,
  path: string,
  output: Record<string, string>,
) {
  if (Array.isArray(value)) {
    if (value.every((entry) => typeof entry === "string")) {
      output[path] = value.join(" ")
      return
    }

    value.forEach((entry, index) => {
      flattenErrors(entry, path ? path + "." + index : String(index), output)
    })
    return
  }

  if (isRecord(value)) {
    Object.entries(value).forEach(([key, entry]) => {
      flattenErrors(entry, path ? path + "." + key : key, output)
    })
    return
  }

  if (typeof value === "string" && path) {
    output[path] = value
  }
}

function toMultipartPayload(input: CreateItemRequest) {
  const formData = new FormData()
  const scalarFields: Array<keyof Omit<CreateItemRequest, "image" | "units">> = [
    "code",
    "name",
    "secondary_name",
    "generic_name",
    "description",
    "behaviour",
    "group_code",
    "status",
    "tax_status",
    "shelf_code",
    "manufacturer",
  ]

  scalarFields.forEach((field) => formData.append(field, input[field]))

  input.units.forEach((unit, unitIndex) => {
    const prefix = "units[" + unitIndex + "]"
    formData.append(prefix + "unit", unit.unit)
    formData.append(prefix + "co_factor", unit.co_factor)
    if (unit.barcode) {
      formData.append(prefix + "barcode", unit.barcode)
    }

    unit.prices.forEach((price, priceIndex) => {
      const pricePrefix = prefix + "prices[" + priceIndex + "]"
      formData.append(pricePrefix + "price_list_type", price.price_list_type)
      formData.append(pricePrefix + "sale_price", price.sale_price)
      formData.append(
        pricePrefix + "minimum_selling_price",
        price.minimum_selling_price,
      )
    })
  })

  if (input.image) {
    formData.append("image", input.image)
  }

  return formData
}

export async function createItem(
  input: CreateItemRequest,
): Promise<ItemResponse> {
  const payload = input.image
    ? toMultipartPayload(input)
    : { ...input, image: undefined }

  const response = await apiClient.post<ItemResponse>("/api/items/", payload)
  return response.data
}

export async function listItems(params: {
  search?: string
  status?: string
  tax_status?: string
  ordering?: string
}): Promise<ItemListRecord[]> {
  const response = await apiClient.get<ItemListRecord[] | { results: ItemListRecord[] }>(
    "/api/items/",
    { params },
  )
  return Array.isArray(response.data) ? response.data : response.data.results
}

export function parseItemApiError(error: unknown): ItemApiError {
  if (!axios.isAxiosError(error)) {
    return {
      message: "An unexpected error occurred while creating the item.",
      fieldErrors: {},
    }
  }

  if (!error.response) {
    return {
      message:
        "Unable to reach the server. Check your connection and try again.",
      fieldErrors: {},
    }
  }

  const fieldErrors: Record<string, string> = {}
  flattenErrors(error.response.data, "", fieldErrors)

  const detail =
    isRecord(error.response.data) &&
    typeof error.response.data.detail === "string"
      ? error.response.data.detail
      : null

  return {
    message:
      detail ||
      (error.response.status === 400
        ? "Please correct the highlighted fields."
        : "The server could not create the item. Please try again."),
    fieldErrors,
  }
}
