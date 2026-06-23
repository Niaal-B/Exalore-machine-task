import { QuotationItemRow } from "@/features/sales-quotation/components/QuotationItemRow"
import { DUMMY_LINES } from "@/features/sales-quotation/types/quotation-dummy"

const COLUMNS = [
  { label: "# Row", className: "w-14 text-center" },
  { label: "Code", className: "min-w-[120px]" },
  { label: "Description", className: "min-w-[180px]" },
  { label: "Unit", className: "w-20" },
  { label: "Qty", className: "w-20 text-right" },
  { label: "Rate", className: "w-24 text-right" },
  { label: "Disc %", className: "w-20 text-right" },
  { label: "Disc Amt", className: "w-24 text-right" },
  { label: "NET", className: "w-24 text-right" },
  { label: "VAT", className: "w-20 text-right" },
  { label: "Net After VAT", className: "w-28 text-right" },
]

export function QuotationItemsSection() {
  return (
    <section>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-gradient-to-b from-[#1c2331] to-[#111827] text-white">
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className={`border-r border-slate-700/50 px-3 py-3 text-left text-[11px] font-semibold tracking-wide ${col.className} last:border-r-0`}
                >
                  {col.label}
                  <div className="text-[9px] font-normal text-slate-400">
                    {col.label === "# Row" ? "" : col.label === "Code" || col.label === "Description" ? "TEXT" : col.label === "Unit" ? "DROPDOWN" : "NUMBER"}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DUMMY_LINES.map((line, index) => (
              <QuotationItemRow key={line.id} row={line} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
