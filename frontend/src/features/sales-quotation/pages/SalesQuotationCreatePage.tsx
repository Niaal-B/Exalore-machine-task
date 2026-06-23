import { useMemo, useState } from "react"

import { QuotationActionBar } from "@/features/sales-quotation/components/QuotationActionBar"
import { QuotationHeaderSection } from "@/features/sales-quotation/components/QuotationHeaderSection"
import { QuotationItemsSection } from "@/features/sales-quotation/components/QuotationItemsSection"
import { QuotationTotalsSection } from "@/features/sales-quotation/components/QuotationTotalsSection"

import type { Customer } from "@/features/sales-quotation/types/customer"
import type { QuotationForm } from "@/features/sales-quotation/types/quotation"

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

export function SalesQuotationCreatePage() {
  const [form, setForm] = useState<QuotationForm>(createInitialForm)

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

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col bg-[#f4f6fa] overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Page header */}
        <div className="mb-3 rounded-t-xl bg-white py-3 shadow-sm text-center border-b-2 border-indigo-50">
          <h1 className="text-xl font-bold text-[#1e293b]">
            Sales Quotation
          </h1>
        </div>

        <div className="flex flex-col gap-3 bg-white p-3 rounded-b-xl shadow-sm">
          {/* Sections */}
          <QuotationHeaderSection
            values={form}
            selectedCustomer={selectedCustomer}
            onChange={updateForm}
            onCustomerSelect={selectCustomer}
            onCustomerClear={clearCustomer}
          />
          
          {/* Notice Bar */}
          <div className="rounded-md bg-[#fff4cc] px-4 py-2 text-sm font-medium text-[#856404] border border-[#ffeeba]">
            Click 'New/Edit' to enable the form
          </div>

          <QuotationItemsSection />
          
          <div className="mt-auto">
            <QuotationTotalsSection />
          </div>
        </div>
      </div>

      {/* Sticky footer action bar */}
      <QuotationActionBar />
    </div>
  )
}
