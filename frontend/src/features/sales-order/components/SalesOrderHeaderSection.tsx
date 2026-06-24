import type { ReactNode } from "react"

import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { QuotationLookupDialog } from "@/features/sales-order/components/QuotationLookupDialog"
import type { SalesOrderForm } from "@/features/sales-order/types/sales-order"

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="min-w-0">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

export function SalesOrderHeaderSection({
  order,
}: {
  order: SalesOrderForm
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Field label="SO No">
          <Input readOnly defaultValue={order.salesOrderNo} className="h-9 bg-slate-50 text-xs" />
        </Field>
        <Field label="Sales Order Type">
          <Select defaultValue={order.salesOrderType} className="h-9 text-xs">
            <option value="normal">Normal</option>
          </Select>
        </Field>
        <Field label="Issue Date">
          <DatePicker defaultValue={order.issueDate} className="h-9 text-xs" />
        </Field>
        <Field label="Valid Date">
          <DatePicker defaultValue={order.validDate} className="h-9 text-xs" />
        </Field>
        <Field label="Linked Quotation">
          <div className="flex gap-1.5">
            <Input readOnly defaultValue="No quotation linked" className="h-9 min-w-0 bg-slate-50 text-xs" />
            <QuotationLookupDialog />
          </div>
        </Field>
        <Field label="Customer PO">
          <Input defaultValue={order.customerPo} className="h-9 text-xs" />
        </Field>

        <Field label="Customer">
          <Input defaultValue={order.customer} className="h-9 text-xs" />
        </Field>
        <Field label="Sales Executive">
          <Select defaultValue={order.salesExecutive} className="h-9 text-xs">
            <option value="Ahmed Al-Farsi">Ahmed Al-Farsi</option>
          </Select>
        </Field>
        <Field label="Delivery Place">
          <Input defaultValue={order.deliveryPlace} className="h-9 text-xs" />
        </Field>
        <Field label="Currency">
          <Select defaultValue={order.currency} className="h-9 text-xs">
            <option value="SAR">SAR - Saudi Riyal</option>
            <option value="AED">AED - UAE Dirham</option>
            <option value="QAR">QAR - Qatari Riyal</option>
          </Select>
        </Field>
        <Field label="Exchange Rate">
          <Input defaultValue={order.exchangeRate} className="h-9 text-right text-xs" />
        </Field>
        <Field label="Notes">
          <Textarea defaultValue={order.notes} rows={1} className="h-9 py-2 text-xs" />
        </Field>
      </div>
    </section>
  )
}
