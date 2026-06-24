import { Input } from "@/components/ui/input"

const TOTALS = [
  ["Gross Amount", "800.0000"],
  ["Discount Amount", "24.0000"],
  ["Net Amount", "776.0000"],
  ["VAT Amount", "91.6500"],
  ["Net After VAT", "867.6500"],
]

export function OrderTotalsSection() {
  return (
    <section className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-5">
      {TOTALS.map(([label, value]) => (
        <label key={label}>
          <span className="field-label">{label}</span>
          <Input readOnly defaultValue={value} className="h-9 bg-slate-50 text-right text-xs font-semibold" />
        </label>
      ))}
    </section>
  )
}
