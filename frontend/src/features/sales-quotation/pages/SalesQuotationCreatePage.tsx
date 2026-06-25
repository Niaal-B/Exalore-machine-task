import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { SalesDocumentPrintDialog } from "@/features/sales-documents/components/SalesDocumentPrintDialog"
import {
  quotationPreviewDocument,
  savedQuotationDocument,
} from "@/features/sales-documents/mappers/printableDocumentMappers"
import type { PrintableSalesDocument } from "@/features/sales-documents/types/printable-sales-document"
import { QuotationActionBar } from "@/features/sales-quotation/components/QuotationActionBar"
import { QuotationHeaderSection } from "@/features/sales-quotation/components/QuotationHeaderSection"
import {
  createQuotationLine,
  QuotationItemsSection,
} from "@/features/sales-quotation/components/QuotationItemsSection"
import { QuotationTotalsSection } from "@/features/sales-quotation/components/QuotationTotalsSection"
import { QuotationToast } from "@/features/sales-quotation/components/QuotationToast"
import { mapQuotationPayload } from "@/features/sales-quotation/mappers/quotationPayloadMapper"
import {
  createQuotation,
  getQuotation,
  updateQuotation,
} from "@/features/sales-quotation/services/quotationService"

import type { Customer } from "@/features/sales-quotation/types/customer"
import type { QuotationLine } from "@/features/sales-quotation/types/quotation-line"
import type { QuotationForm } from "@/features/sales-quotation/types/quotation"
import { calculateQuotationTotals } from "@/features/sales-quotation/utils/quotationTotals"

type FormMode = "idle" | "create" | "view" | "edit"

function getTodayForDateInput() {
  const now = new Date()
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localTime.toISOString().slice(0, 10)
}

function createInitialForm(): QuotationForm {
  return {
    quotationDate: getTodayForDateInput(),
    customerCode: "",
    customerName: "",
    customerRefNo: "",
    salesExecutive: "",
    attention: "",
    payTerms: "",
    deliveryPlace: "",
    currency: "SAR",
    exchangeRate: "1",
    notes: "",
  }
}

function validationMessages(value: unknown, field = ""): string[] {
  if (typeof value === "string") {
    const visibleField = field === "lines" ? "" : field
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

export function SalesQuotationCreatePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [formMode, setFormMode] = useState<FormMode>("idle")
  const [loadedQuotationId, setLoadedQuotationId] = useState<number | null>(null)
  const [form, setForm] = useState<QuotationForm>(createInitialForm)
  const [lines, setLines] = useState<QuotationLine[]>(() => [
    createQuotationLine(),
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [savedPrintDocument, setSavedPrintDocument] =
    useState<PrintableSalesDocument | null>(null)
  const [activePrintDocument, setActivePrintDocument] =
    useState<PrintableSalesDocument | null>(null)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const isEditing = formMode === "create" || formMode === "edit"
  const isLoadedView = formMode === "view"
  const isUpdating = formMode === "edit" && loadedQuotationId !== null
  const totals = useMemo(() => calculateQuotationTotals(lines), [lines])

  const selectedCustomer = useMemo<Customer | undefined>(() => {
    if (form.customerId === undefined) return undefined

    return {
      id: form.customerId,
      code: form.customerCode,
      name: form.customerName,
      attention: form.attention,
      payTerms: form.payTerms,
      deliveryPlace: form.deliveryPlace,
      currency: form.currency,
    }
  }, [
    form.attention,
    form.currency,
    form.customerCode,
    form.customerId,
    form.customerName,
    form.deliveryPlace,
    form.payTerms,
  ])

  function updateForm(changes: Partial<QuotationForm>) {
    setForm((current) => ({ ...current, ...changes }))
  }

  function selectCustomer(customer: Customer) {
    updateForm({
      customerId: customer.id,
      customerCode: customer.code,
      customerName: customer.name,
      attention: customer.attention,
      payTerms: customer.payTerms,
      deliveryPlace: customer.deliveryPlace,
      currency: customer.currency || "SAR",
      exchangeRate: "1",
    })
  }

  function clearCustomer() {
    updateForm({
      customerId: undefined,
      customerCode: "",
      customerName: "",
      attention: "",
      payTerms: "",
      deliveryPlace: "",
      currency: "SAR",
      exchangeRate: "1",
    })
  }

  function resetQuotation() {
    setForm(createInitialForm())
    setLines([createQuotationLine()])
    setSaveError("")
    setLoadedQuotationId(null)
  }

  function startNewQuotation() {
    resetQuotation()
    setSearchParams({})
    setSuccessMessage("")
    setSavedPrintDocument(null)
    setFormMode("create")
  }

  function cancelQuotation() {
    resetQuotation()
    setSearchParams({})
    setSuccessMessage("")
    setFormMode("idle")
  }

  function loadQuotationIntoForm(quotation: Awaited<ReturnType<typeof getQuotation>>) {
    setLoadedQuotationId(quotation.id)
    setForm({
      quotationDate: quotation.quotation_date,
      customerId: quotation.customer_id,
      customerCode: quotation.customer_code,
      customerName: quotation.customer_name,
      customerRefNo: quotation.customer_ref_no,
      salesExecutive: quotation.sales_executive,
      attention: quotation.attention,
      payTerms: quotation.pay_terms,
      deliveryPlace: quotation.delivery_place,
      currency: quotation.currency,
      exchangeRate: quotation.exchange_rate,
      notes: quotation.notes,
    })
    setLines(
      quotation.lines.map((line) => ({
        localId: crypto.randomUUID(),
        itemUnitId: line.item_unit_id,
        itemCode: line.item_code,
        itemName: line.item_name,
        description: line.description,
        unit: line.unit,
        quantity: line.quantity,
        rate: line.rate,
        defaultRate: line.rate,
        discountPercentage: line.discount_percentage,
        discountAmount: line.discount_amount,
        vatPercentage: line.vat_percentage,
        vatAmount: line.vat_amount,
        netAmount: line.net_amount,
        netAfterVat: line.net_after_vat,
      })),
    )
    setSavedPrintDocument(savedQuotationDocument(quotation))
    setFormMode("view")
  }

  function handlePrimaryAction() {
    if (formMode === "view") {
      setSuccessMessage("")
      setSaveError("")
      setFormMode("edit")
      return
    }

    if (formMode === "edit") {
      void saveQuotation()
      return
    }

    startNewQuotation()
  }

  async function saveQuotation() {
    if (!isEditing || isSaving) return

    setSaveError("")
    setSuccessMessage("")
    setIsSaving(true)

    try {
      const payload = mapQuotationPayload(form, lines, {
        includeRates: isUpdating,
      })
      const quotation =
        isUpdating && loadedQuotationId !== null
          ? await updateQuotation(loadedQuotationId, payload)
          : await createQuotation(payload)

      setSavedPrintDocument(savedQuotationDocument(quotation))
      resetQuotation()
      setSearchParams({})
      setFormMode("idle")
      setSuccessMessage(
        isUpdating
          ? `Quotation ${quotation.quotation_no} was updated successfully.`
          : `Quotation ${quotation.quotation_no} was created successfully.`,
      )
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setSaveError("Unable to reach the server. Check your connection and try again.")
        } else {
          const messages = validationMessages(error.response.data)
          setSaveError(
            messages.join(" · ") ||
              "The server could not create the quotation. Please try again.",
          )
        }
      } else if (error instanceof Error) {
        setSaveError(error.message)
      } else {
        setSaveError("An unexpected error occurred while saving the quotation.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  function previewQuotation() {
    setActivePrintDocument(quotationPreviewDocument(form, lines, totals))
    setIsPrintOpen(true)
  }

  function printSavedQuotation() {
    if (!savedPrintDocument) return
    setActivePrintDocument(savedPrintDocument)
    setIsPrintOpen(true)
  }

  useEffect(() => {
    const id = Number(searchParams.get("id"))
    if (!Number.isInteger(id) || id <= 0) return

    let isCurrent = true
    setSaveError("")
    setSuccessMessage("")

    async function loadQuotation() {
      try {
        const quotation = await getQuotation(id)
        if (isCurrent) loadQuotationIntoForm(quotation)
      } catch {
        if (isCurrent) {
          resetQuotation()
          setFormMode("idle")
          setSaveError("Unable to load the selected quotation.")
        }
      }
    }

    void loadQuotation()

    return () => {
      isCurrent = false
    }
  }, [searchParams])

  const primaryLabel =
    formMode === "view" ? "Edit" : formMode === "edit" ? "Update" : "New"

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col bg-[#f4f6fa] overflow-hidden">
      {saveError && (
        <QuotationToast
          type="error"
          message={saveError}
          onClose={() => setSaveError("")}
        />
      )}
      {successMessage && (
        <QuotationToast
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
      <SalesDocumentPrintDialog
        document={activePrintDocument}
        open={isPrintOpen}
        onOpenChange={setIsPrintOpen}
      />
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Page header */}
        <div className="mb-3 rounded-t-xl bg-white py-3 shadow-sm text-center border-b-2 border-indigo-50">
          <h1 className="text-xl font-bold text-[#1e293b]">
            Sales Quotation
          </h1>
        </div>

        <div className="flex flex-col gap-3 bg-white p-3 rounded-b-xl shadow-sm">
          {/* Notice Bar */}
          <div className={`rounded-md px-4 py-2 text-sm font-medium border ${
            isEditing
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-[#ffeeba] bg-[#fff4cc] text-[#856404]"
          }`}>
            {isEditing
              ? isUpdating
                ? "Edit mode — update the draft quotation and click Update."
                : "New quotation mode — complete the form and click Save."
              : isLoadedView
                ? "View mode — click Edit to modify this draft quotation."
                : "Click New to enable the quotation form."}
          </div>

          <fieldset
            disabled={!isEditing || isSaving}
            className="flex flex-col gap-3 disabled:opacity-60"
          >
            <QuotationHeaderSection
              values={form}
              selectedCustomer={selectedCustomer}
              onChange={updateForm}
              onCustomerSelect={selectCustomer}
              onCustomerClear={clearCustomer}
            />

            <QuotationItemsSection lines={lines} setLines={setLines} />

            <div className="mt-auto">
              <QuotationTotalsSection totals={totals} />
            </div>
          </fieldset>
        </div>
      </div>

      {/* Sticky footer action bar */}
      <QuotationActionBar
        isEditing={isEditing}
        isSaving={isSaving}
        canPreview={isEditing && lines.some((line) => line.itemUnitId !== undefined)}
        canPrint={savedPrintDocument !== null}
        primaryLabel={primaryLabel}
        canSave={formMode === "create"}
        onPrimary={handlePrimaryAction}
        onSave={saveQuotation}
        onPreview={previewQuotation}
        onPrint={printSavedQuotation}
        onCancel={cancelQuotation}
      />
    </div>
  )
}
