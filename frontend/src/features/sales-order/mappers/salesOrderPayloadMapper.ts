import type { CreateSalesOrderPayload } from "@/features/sales-order/types/createSalesOrderPayload"
import type { SalesOrderForm } from "@/features/sales-order/types/sales-order"

export function mapSalesOrderPayload(
  form: SalesOrderForm,
): CreateSalesOrderPayload {
  if (form.customerId === undefined) {
    throw new Error("Select a customer or load a quotation before saving.")
  }
  if (form.lines.length === 0) {
    throw new Error("Add at least one item before saving the sales order.")
  }

  const lines = form.lines.map((line, index) => {
    if (line.itemUnitId === undefined) {
      throw new Error(`Select an item for line ${index + 1}.`)
    }
    return {
      item_unit_id: line.itemUnitId,
      quantity: line.quantity,
      rate: line.rate,
      discount_percentage: line.discountPercentage || "0",
    }
  })

  return {
    ...(form.quotationId !== undefined
      ? { quotation_id: form.quotationId }
      : {}),
    customer_id: form.customerId,
    sales_order_type: form.salesOrderType,
    issue_date: form.issueDate,
    valid_date: form.validDate || null,
    customer_po: form.customerPo.trim(),
    sales_executive: form.salesExecutive.trim(),
    delivery_place: form.deliveryPlace.trim(),
    currency: form.currency,
    exchange_rate: form.exchangeRate,
    notes: form.notes.trim(),
    lines,
  }
}
