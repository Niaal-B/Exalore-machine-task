import { Input } from "@/components/ui/input"

export function QuotationTotalsSection() {
  return (
    <section>
      <div className="grid grid-cols-5 gap-3 pt-3 mt-3 border-t border-slate-200">
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Gross</span>
          <Input readOnly value="4622.50" className="bg-slate-50 h-9 text-xs" />
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Disc</span>
          <Input readOnly value="327.50" className="bg-slate-50 h-9 text-xs" />
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Net Total</span>
          <Input readOnly value="4622.50" className="bg-slate-50 h-9 text-xs" />
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">VAT</span>
          <Input readOnly value="573.38" className="bg-slate-50 h-9 text-xs" />
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">Net After VAT</span>
          <Input readOnly value="5195.88" className="bg-slate-50 h-9 text-xs" />
        </div>
      </div>
    </section>
  )
}
