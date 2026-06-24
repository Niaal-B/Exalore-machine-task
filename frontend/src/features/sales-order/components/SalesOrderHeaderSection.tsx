import type { ReactNode } from "react"

import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { QuotationLookupDialog } from "@/features/sales-order/components/QuotationLookupDialog"
import type { QuotationDetail } from "@/features/sales-order/types/quotation-detail"
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
  onChange,
  onQuotationSelect,
}: {
  order: SalesOrderForm
  onChange: (changes: Partial<SalesOrderForm>) => void
  onQuotationSelect: (quotation: QuotationDetail) => void
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Field label="SO No">
          <Input readOnly value={order.salesOrderNo} className="h-9 bg-slate-50 text-xs" />
        </Field>
        <Field label="Sales Order Type">
          <Select value={order.salesOrderType} className="h-9 text-xs" onChange={(event) => onChange({ salesOrderType: event.target.value })}>
            <option value="normal">Normal</option>
          </Select>
        </Field>
        <Field label="Issue Date">
          <DatePicker value={order.issueDate} className="h-9 text-xs" onChange={(event) => onChange({ issueDate: event.target.value })} />
        </Field>
        <Field label="Valid Date">
          <DatePicker value={order.validDate} className="h-9 text-xs" onChange={(event) => onChange({ validDate: event.target.value })} />
        </Field>
        <Field label="Linked Quotation">
          <div className="flex gap-1.5">
            <Input readOnly value={order.linkedQuotationLabel} className="h-9 min-w-0 bg-slate-50 text-xs" />
            <QuotationLookupDialog onSelect={onQuotationSelect} />
          </div>
        </Field>
        <Field label="Customer PO">
          <Input value={order.customerPo} className="h-9 text-xs" onChange={(event) => onChange({ customerPo: event.target.value })} />
        </Field>

        <Field label="Customer">
          <Input readOnly value={order.customerCode && order.customerName ? `${order.customerCode} - ${order.customerName}` : ""} className="h-9 bg-slate-50 text-xs" />
        </Field>
        <Field label="Sales Executive">
          <Select value={order.salesExecutive} className="h-9 text-xs" onChange={(event) => onChange({ salesExecutive: event.target.value })}>
            <option value="">Select sales executive</option>
            <option value="Ahmed Al-Farsi">Ahmed Al-Farsi</option>
          </Select>
        </Field>
        <Field label="Delivery Place">
          <Input value={order.deliveryPlace} className="h-9 text-xs" onChange={(event) => onChange({ deliveryPlace: event.target.value })} />
        </Field>
        <Field label="Currency">
          <Select value={order.currency} className="h-9 text-xs" onChange={(event) => onChange({ currency: event.target.value })}>
            <option value="SAR">SAR - Saudi Riyal</option>
            <option value="AED">AED - UAE Dirham</option>
            <option value="QAR">QAR - Qatari Riyal</option>
          </Select>
        </Field>
        <Field label="Exchange Rate">
          <Input value={order.exchangeRate} className="h-9 text-right text-xs" onChange={(event) => onChange({ exchangeRate: event.target.value })} />
        </Field>
        <Field label="Notes">
          <Textarea value={order.notes} rows={1} className="h-9 py-2 text-xs" onChange={(event) => onChange({ notes: event.target.value })} />
        </Field>
      </div>
    </section>
  )
}
