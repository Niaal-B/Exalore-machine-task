import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

export function QuotationReferenceSection() {
  return (
    <section className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[2fr_1fr_1fr]">
      <label>
        <span className="field-label">Quotation Search</span>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <Input placeholder="Search quotation number" className="h-9 pl-9 text-xs" />
        </div>
      </label>
      <label>
        <span className="field-label">Quotation Number</span>
        <Input readOnly defaultValue="SQ-20260620-A81F2C" className="h-9 bg-slate-50 text-xs" />
      </label>
      <label>
        <span className="field-label">Quotation Status</span>
        <div className="flex h-9 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
          Confirmed
        </div>
      </label>
    </section>
  )
}
