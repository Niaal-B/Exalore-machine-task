import { Input } from "@/components/ui/input"
import type { QuotationTotals } from "@/features/sales-quotation/utils/quotationTotals"

type QuotationTotalsSectionProps = {
  totals: QuotationTotals
}

export function QuotationTotalsSection({ totals }: QuotationTotalsSectionProps) {
  const values = [
    ["Gross Amount", totals.grossAmount],
    ["Discount Amount", totals.discountAmount],
    ["Net Amount", totals.netAmount],
    ["VAT Amount", totals.vatAmount],
    ["Net After VAT", totals.netAfterVat],
  ] as const

  return (
    <section>
      <div className="grid grid-cols-5 gap-3 pt-3 mt-3 border-t border-slate-200">
        {values.map(([label, value]) => (
          <div key={label}>
            <span className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">
              {label}
            </span>
            <Input
              readOnly
              value={value.toFixed(4)}
              className="h-9 bg-slate-50 text-right text-xs"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
