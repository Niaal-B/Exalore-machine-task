import axios from "axios"
import { useMemo, useState } from "react"

import { QuotationActionBar } from "@/features/sales-quotation/components/QuotationActionBar"
import { QuotationHeaderSection } from "@/features/sales-quotation/components/QuotationHeaderSection"
import {
  createQuotationLine,
  QuotationItemsSection,
} from "@/features/sales-quotation/components/QuotationItemsSection"
import { QuotationTotalsSection } from "@/features/sales-quotation/components/QuotationTotalsSection"
import { QuotationToast } from "@/features/sales-quotation/components/QuotationToast"
import { mapQuotationPayload } from "@/features/sales-quotation/mappers/quotationPayloadMapper"
import { createQuotation } from "@/features/sales-quotation/services/quotationService"

import type { Customer } from "@/features/sales-quotation/types/customer"
import type { QuotationLine } from "@/features/sales-quotation/types/quotation-line"
import type { QuotationForm } from "@/features/sales-quotation/types/quotation"
import { calculateQuotationTotals } from "@/features/sales-quotation/utils/quotationTotals"

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
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<QuotationForm>(createInitialForm)
  const [lines, setLines] = useState<QuotationLine[]>(() => [
    createQuotationLine(),
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
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
  }

  function startNewQuotation() {
    resetQuotation()
    setSuccessMessage("")
    setIsEditing(true)
  }

  function cancelQuotation() {
    resetQuotation()
    setSuccessMessage("")
    setIsEditing(false)
  }

  async function saveQuotation() {
    if (!isEditing || isSaving) return

    setSaveError("")
    setSuccessMessage("")
    setIsSaving(true)

    try {
      const payload = mapQuotationPayload(form, lines)
      const quotation = await createQuotation(payload)

      resetQuotation()
      setIsEditing(false)
      setSuccessMessage(
        `Quotation ${quotation.quotation_no} was created successfully.`,
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
              ? "New quotation mode — complete the form and click Save."
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
        onNew={startNewQuotation}
        onSave={saveQuotation}
        onCancel={cancelQuotation}
      />
    </div>
  )
}
