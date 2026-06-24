import { Plus } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

import { QuotationItemRow } from "@/features/sales-quotation/components/QuotationItemRow"
import type {
  ItemSearchResult,
  QuotationLine,
} from "@/features/sales-quotation/types/quotation-line"
import { calculateQuotationLine } from "@/features/sales-quotation/utils/quotationCalculations"

const COLUMNS = [
  "#",
  "Item Code",
  "Item Name",
  "Description",
  "Unit",
  "Qty",
  "Rate",
  "Disc %",
  "Disc Amt",
  "Net",
  "VAT",
  "Net After VAT",
  "",
]

export function createQuotationLine(): QuotationLine {
  return {
    localId: crypto.randomUUID(),
    itemCode: "",
    itemName: "",
    description: "",
    unit: "",
    quantity: "1",
    rate: "0",
    discountPercentage: "0",
    discountAmount: "0.0000",
    vatPercentage: "0",
    vatAmount: "0.0000",
    netAmount: "0.0000",
    netAfterVat: "0.0000",
  }
}

type QuotationItemsSectionProps = {
  lines: QuotationLine[]
  setLines: Dispatch<SetStateAction<QuotationLine[]>>
}

export function QuotationItemsSection({
  lines,
  setLines,
}: QuotationItemsSectionProps) {

  function updateLine(localId: string, changes: Partial<QuotationLine>) {
    setLines((current) =>
      current.map((line) =>
        line.localId === localId
          ? calculateQuotationLine({ ...line, ...changes })
          : line,
      ),
    )
  }

  function selectItem(localId: string, item: ItemSearchResult) {
    updateLine(localId, {
      itemUnitId: item.itemUnitId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      description: item.description,
      unit: item.unit,
      rate: item.salePrice,
      defaultRate: item.salePrice,
      vatPercentage: item.vatPercentage,
    })
  }

  function deleteLine(localId: string) {
    setLines((current) => current.filter((line) => line.localId !== localId))
  }

  return (
    <section>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          onClick={() =>
            setLines((current) => [...current, createQuotationLine()])
          }
        >
          <Plus size={14} /> Add Row
        </button>
      </div>
      <div className="min-w-0 overflow-hidden rounded-md border border-slate-200">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[3%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[15%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
            <col className="w-[7%]" />
            <col className="w-[5%]" />
            <col className="w-[7%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            <col className="w-[5%]" />
          </colgroup>
          <thead>
            <tr className="bg-gradient-to-b from-[#1c2331] to-[#111827] text-white">
              {COLUMNS.map((label, index) => (
                <th key={`${label}-${index}`} className="truncate border-r border-slate-700/50 px-1.5 py-3 text-left text-[10px] font-semibold last:border-r-0">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <QuotationItemRow
                key={line.localId}
                row={line}
                index={index}
                canDelete={lines.length > 1}
                onChange={(changes) => updateLine(line.localId, changes)}
                onItemSelect={(item) => selectItem(line.localId, item)}
                onDelete={() => deleteLine(line.localId)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
