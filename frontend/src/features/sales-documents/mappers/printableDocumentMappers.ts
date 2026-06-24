import type { PrintableSalesDocument } from "@/features/sales-documents/types/printable-sales-document"
import type { CreateSalesOrderResponse } from "@/features/sales-order/types/createSalesOrderResponse"
import type { SalesOrderForm } from "@/features/sales-order/types/sales-order"
import type { CreateQuotationResponse } from "@/features/sales-quotation/types/createQuotationResponse"
import type { QuotationLine } from "@/features/sales-quotation/types/quotation-line"
import type { QuotationForm } from "@/features/sales-quotation/types/quotation"
import type { QuotationTotals } from "@/features/sales-quotation/utils/quotationTotals"

function formattedTotals(totals: QuotationTotals) {
  return {
    grossAmount: totals.grossAmount.toFixed(4),
    discountAmount: totals.discountAmount.toFixed(4),
    netAmount: totals.netAmount.toFixed(4),
    vatAmount: totals.vatAmount.toFixed(4),
    netAfterVat: totals.netAfterVat.toFixed(4),
  }
}

function previewLines(lines: QuotationLine[]) {
  return lines.map((line, index) => ({
    lineNo: index + 1,
    itemCode: line.itemCode,
    description: line.description || line.itemName,
    unit: line.unit,
    quantity: line.quantity,
    rate: line.rate,
    discountPercentage: line.discountPercentage,
    netAmount: line.netAmount,
    vatAmount: line.vatAmount,
    netAfterVat: line.netAfterVat,
  }))
}

export function quotationPreviewDocument(
  form: QuotationForm,
  lines: QuotationLine[],
  totals: QuotationTotals,
): PrintableSalesDocument {
  return {
    title: "Sales Quotation",
    documentNumber: "DRAFT / UNSAVED",
    documentDate: form.quotationDate,
    status: "Draft Preview",
    isDraftPreview: true,
    customerCode: form.customerCode,
    customerName: form.customerName,
    currency: form.currency,
    exchangeRate: form.exchangeRate,
    references: [
      { label: "Customer Reference", value: form.customerRefNo },
      { label: "Sales Executive", value: form.salesExecutive },
      { label: "Delivery Place", value: form.deliveryPlace },
    ],
    notes: form.notes,
    lines: previewLines(lines),
    totals: formattedTotals(totals),
  }
}

export function savedQuotationDocument(
  quotation: CreateQuotationResponse,
): PrintableSalesDocument {
  return {
    title: "Sales Quotation",
    documentNumber: quotation.quotation_no,
    documentDate: quotation.quotation_date,
    status: quotation.status,
    isDraftPreview: false,
    customerCode: quotation.customer_code,
    customerName: quotation.customer_name,
    currency: quotation.currency,
    exchangeRate: quotation.exchange_rate,
    references: [
      { label: "Customer Reference", value: quotation.customer_ref_no },
      { label: "Sales Executive", value: quotation.sales_executive },
      { label: "Delivery Place", value: quotation.delivery_place },
    ],
    notes: quotation.notes,
    lines: quotation.lines.map((line) => ({
      lineNo: line.line_no,
      itemCode: line.item_code,
      description: line.description || line.item_name,
      unit: line.unit,
      quantity: line.quantity,
      rate: line.rate,
      discountPercentage: line.discount_percentage,
      netAmount: line.net_amount,
      vatAmount: line.vat_amount,
      netAfterVat: line.net_after_vat,
    })),
    totals: {
      grossAmount: quotation.gross_amount,
      discountAmount: quotation.discount_amount,
      netAmount: quotation.net_amount,
      vatAmount: quotation.vat_amount,
      netAfterVat: quotation.net_after_vat,
    },
  }
}

export function salesOrderPreviewDocument(
  form: SalesOrderForm,
  totals: QuotationTotals,
): PrintableSalesDocument {
  return {
    title: "Sales Order",
    documentNumber: "DRAFT / UNSAVED",
    documentDate: form.issueDate,
    status: "Draft Preview",
    isDraftPreview: true,
    customerCode: form.customerCode,
    customerName: form.customerName,
    currency: form.currency,
    exchangeRate: form.exchangeRate,
    references: [
      { label: "Linked Quotation", value: form.quotationNo },
      { label: "Customer PO", value: form.customerPo },
      { label: "Delivery Place", value: form.deliveryPlace },
    ],
    notes: form.notes,
    lines: previewLines(form.lines),
    totals: formattedTotals(totals),
  }
}

export function savedSalesOrderDocument(
  order: CreateSalesOrderResponse,
): PrintableSalesDocument {
  return {
    title: "Sales Order",
    documentNumber: order.sales_order_no,
    documentDate: order.issue_date,
    status: order.status,
    isDraftPreview: false,
    customerCode: order.customer_code,
    customerName: order.customer_name,
    currency: order.currency,
    exchangeRate: order.exchange_rate,
    references: [
      { label: "Quotation ID", value: order.quotation_id?.toString() ?? "Manual order" },
      { label: "Customer PO", value: order.customer_po },
      { label: "Delivery Place", value: order.delivery_place },
    ],
    notes: order.notes,
    lines: order.lines.map((line) => ({
      lineNo: line.line_no,
      itemCode: line.item_code,
      description: line.description || line.item_name,
      unit: line.unit,
      quantity: line.quantity,
      rate: line.rate,
      discountPercentage: line.discount_percentage,
      netAmount: line.net_amount,
      vatAmount: line.vat_amount,
      netAfterVat: line.net_after_vat,
    })),
    totals: {
      grossAmount: order.gross_amount,
      discountAmount: order.discount_amount,
      netAmount: order.net_amount,
      vatAmount: order.vat_amount,
      netAfterVat: order.net_after_vat,
    },
  }
}
