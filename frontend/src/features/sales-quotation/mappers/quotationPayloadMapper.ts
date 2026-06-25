import type { CreateQuotationPayload } from "@/features/sales-quotation/types/createQuotationPayload"
import type { QuotationLine } from "@/features/sales-quotation/types/quotation-line"
import type { QuotationForm } from "@/features/sales-quotation/types/quotation"

export function mapQuotationPayload(
  form: QuotationForm,
  lines: QuotationLine[],
  options: { includeRates?: boolean } = {},
): CreateQuotationPayload {
  if (form.customerId === undefined) {
    throw new Error("Select a customer before saving the quotation.")
  }

  if (lines.some((line) => line.itemUnitId === undefined)) {
    throw new Error("Select an item for every quotation row.")
  }

  return {
    customer_id: form.customerId,
    quotation_date: form.quotationDate,
    customer_ref_no: form.customerRefNo.trim(),
    sales_executive: form.salesExecutive.trim(),
    attention: form.attention.trim(),
    pay_terms: form.payTerms.trim(),
    delivery_place: form.deliveryPlace.trim(),
    currency: form.currency,
    exchange_rate: form.exchangeRate,
    notes: form.notes.trim(),
    lines: lines.map((line) => ({
      item_unit_id: line.itemUnitId as number,
      quantity: line.quantity,
      discount_percentage: line.discountPercentage || "0",
      ...(options.includeRates ||
      (line.defaultRate !== undefined && line.rate !== line.defaultRate)
        ? { rate: line.rate }
        : {}),
    })),
  }
}
