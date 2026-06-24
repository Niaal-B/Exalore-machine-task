import axios from "axios"
import { useMemo, useState } from "react"

import { SalesDocumentPrintDialog } from "@/features/sales-documents/components/SalesDocumentPrintDialog"
import {
  salesOrderPreviewDocument,
  savedSalesOrderDocument,
} from "@/features/sales-documents/mappers/printableDocumentMappers"
import type { PrintableSalesDocument } from "@/features/sales-documents/types/printable-sales-document"
import { OrderActionBar } from "@/features/sales-order/components/OrderActionBar"
import { OrderItemsSection } from "@/features/sales-order/components/OrderItemsSection"
import { OrderTotalsSection } from "@/features/sales-order/components/OrderTotalsSection"
import { SalesOrderHeaderSection } from "@/features/sales-order/components/SalesOrderHeaderSection"
import { mapSalesOrderPayload } from "@/features/sales-order/mappers/salesOrderPayloadMapper"
import { createSalesOrder } from "@/features/sales-order/services/salesOrderService"
import { QuotationToast } from "@/features/sales-quotation/components/QuotationToast"
import type { QuotationDetail } from "@/features/sales-order/types/quotation-detail"
import type {
  SalesOrderForm,
} from "@/features/sales-order/types/sales-order"
import { calculateQuotationTotals } from "@/features/sales-quotation/utils/quotationTotals"

function todayForInput() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

function createInitialForm(): SalesOrderForm {
  return {
    salesOrderNo: "Generated on save",
    salesOrderType: "normal",
    issueDate: todayForInput(),
    validDate: "",
    quotationNo: "",
    linkedQuotationLabel: "No quotation linked",
    customerPo: "",
    customerCode: "",
    customerName: "",
    customerRefNo: "",
    salesExecutive: "",
    deliveryPlace: "",
    currency: "SAR",
    exchangeRate: "1",
    notes: "",
    lines: [],
  }
}

function validationMessages(value: unknown, field = ""): string[] {
  if (typeof value === "string") {
    const visibleField = field === "lines" ? "" : field.replaceAll("_", " ")
    return [visibleField ? `${visibleField}: ${value}` : value]
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => validationMessages(item, field))
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      validationMessages(item, field ? `${field}.${key}` : key),
    )
  }
  return []
}

export function SalesOrderCreatePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<SalesOrderForm>(createInitialForm)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [savedPrintDocument, setSavedPrintDocument] =
    useState<PrintableSalesDocument | null>(null)
  const [activePrintDocument, setActivePrintDocument] =
    useState<PrintableSalesDocument | null>(null)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const totals = useMemo(
    () => calculateQuotationTotals(form.lines),
    [form.lines],
  )

  function updateForm(changes: Partial<SalesOrderForm>) {
    setForm((current) => ({ ...current, ...changes }))
  }

  function loadQuotation(quotation: QuotationDetail) {
    setForm((current) => ({
      ...current,
      quotationId: quotation.id,
      quotationNo: quotation.quotation_no,
      linkedQuotationLabel: quotation.quotation_no,
      customerId: quotation.customer_id,
      customerCode: quotation.customer_code,
      customerName: quotation.customer_name,
      customerRefNo: quotation.customer_ref_no,
      customerPo: quotation.customer_ref_no,
      salesExecutive: quotation.sales_executive,
      deliveryPlace: quotation.delivery_place,
      currency: quotation.currency,
      exchangeRate: quotation.exchange_rate,
      notes: quotation.notes,
      lines: quotation.lines.map((line) => ({
        localId: crypto.randomUUID(),
        itemUnitId: line.item_unit_id,
        itemCode: line.item_code,
        itemName: line.item_name,
        description: line.description,
        unit: line.unit,
        quantity: line.quantity,
        rate: line.rate,
        discountPercentage: line.discount_percentage,
        discountAmount: line.discount_amount,
        netAmount: line.net_amount,
        vatPercentage: line.vat_percentage,
        vatAmount: line.vat_amount,
        netAfterVat: line.net_after_vat,
      })),
    }))
  }

  function resetForm() {
    setForm(createInitialForm())
    setSaveError("")
  }

  function startNewOrder() {
    resetForm()
    setSuccessMessage("")
    setSavedPrintDocument(null)
    setIsEditing(true)
  }

  function clearOrder() {
    resetForm()
    setSuccessMessage("")
  }

  function cancelOrder() {
    resetForm()
    setSuccessMessage("")
    setIsEditing(false)
  }

  async function saveSalesOrder() {
    if (!isEditing || isSaving) return

    setIsSaving(true)
    setSaveError("")
    setSuccessMessage("")
    try {
      const payload = mapSalesOrderPayload(form)
      const salesOrder = await createSalesOrder(payload)
      setSavedPrintDocument(savedSalesOrderDocument(salesOrder))
      resetForm()
      setIsEditing(false)
      setSuccessMessage(
        `Sales order ${salesOrder.sales_order_no} was created successfully.`,
      )
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setSaveError("Unable to reach the server. Check your connection and try again.")
        } else {
          const messages = validationMessages(error.response.data)
          setSaveError(
            messages.join(" · ") ||
              "The server could not create the sales order.",
          )
        }
      } else if (error instanceof Error) {
        setSaveError(error.message)
      } else {
        setSaveError("An unexpected error occurred while saving the sales order.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  function previewSalesOrder() {
    setActivePrintDocument(salesOrderPreviewDocument(form, totals))
    setIsPrintOpen(true)
  }

  function printSavedSalesOrder() {
    if (!savedPrintDocument) return
    setActivePrintDocument(savedPrintDocument)
    setIsPrintOpen(true)
  }

  return (
    <div className="flex h-[calc(100vh-68px)] min-w-0 flex-col overflow-hidden bg-[#f4f6fa]">
      {saveError && (
        <QuotationToast
          type="error"
          title="Unable to save sales order"
          message={saveError}
          onClose={() => setSaveError("")}
        />
      )}
      {successMessage && (
        <QuotationToast
          type="success"
          title="Sales order created"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
      <SalesDocumentPrintDialog
        document={activePrintDocument}
        open={isPrintOpen}
        onOpenChange={setIsPrintOpen}
      />
      <div className="min-w-0 flex-1 overflow-y-auto p-3">
        <div className="mb-3 rounded-lg border-b-2 border-indigo-50 bg-white py-3 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Sales Order</h1>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Create a manual order or reference an existing quotation
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className={`rounded-md border px-4 py-2 text-sm font-medium ${
            isEditing
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}>
            {isEditing
              ? "New sales order mode — complete the form and click Save."
              : "Click New to enable the sales order form."}
          </div>
          <fieldset
            disabled={!isEditing || isSaving}
            className="flex min-w-0 flex-col gap-3 disabled:opacity-60"
          >
            <SalesOrderHeaderSection
              order={form}
              onChange={updateForm}
              onQuotationSelect={loadQuotation}
            />
            <OrderItemsSection
              lines={form.lines}
              onChange={(lines) => updateForm({ lines })}
            />
            <OrderTotalsSection totals={totals} />
          </fieldset>
        </div>
      </div>
      <OrderActionBar
        isEditing={isEditing}
        isSaving={isSaving}
        canPreview={isEditing && form.lines.length > 0}
        canPrint={savedPrintDocument !== null}
        onNew={startNewOrder}
        onSave={saveSalesOrder}
        onPreview={previewSalesOrder}
        onPrint={printSavedSalesOrder}
        onClear={clearOrder}
        onCancel={cancelOrder}
      />
    </div>
  )
}
