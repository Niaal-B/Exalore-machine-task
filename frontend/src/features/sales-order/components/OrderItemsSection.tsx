import { Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderItemRow } from "@/features/sales-order/components/OrderItemRow"
import type { SalesOrderLine } from "@/features/sales-order/types/sales-order"
import { ItemSearchField } from "@/features/sales-quotation/components/ItemSearchField"
import type { ItemSearchResult } from "@/features/sales-quotation/types/quotation-line"
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
  "Disc Amount",
  "Net Amount",
  "VAT %",
  "VAT Amount",
  "Net After VAT",
  "Actions",
]

type OrderItemsSectionProps = {
  lines: SalesOrderLine[]
  onChange: (lines: SalesOrderLine[]) => void
}

export function OrderItemsSection({
  lines,
  onChange,
}: OrderItemsSectionProps) {
  const [isAdding, setIsAdding] = useState(false)

  function addItem(item: ItemSearchResult) {
    const line = calculateQuotationLine({
      localId: crypto.randomUUID(),
      itemUnitId: item.itemUnitId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      description: item.description,
      unit: item.unit,
      quantity: "1",
      rate: item.salePrice,
      defaultRate: item.salePrice,
      discountPercentage: "0",
      discountAmount: "0.0000",
      vatPercentage: item.vatPercentage,
      vatAmount: "0.0000",
      netAmount: "0.0000",
      netAfterVat: "0.0000",
    })
    onChange([...lines, line])
    setIsAdding(false)
  }

  function updateLine(localId: string, changes: Partial<SalesOrderLine>) {
    onChange(
      lines.map((line) =>
        line.localId === localId
          ? calculateQuotationLine({ ...line, ...changes })
          : line,
      ),
    )
  }

  function removeLine(localId: string) {
    if (lines.length <= 1) return
    onChange(lines.filter((line) => line.localId !== localId))
  }

  return (
    <section className="min-h-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-12 items-center justify-end gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        {isAdding && (
          <div className="w-72 rounded-md border border-indigo-200 bg-white">
            <ItemSearchField
              key={lines.length}
              value=""
              onSelect={addItem}
              onClear={() => undefined}
            />
          </div>
        )}
        <Button
          type="button"
          className="h-8 bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700"
          onClick={() => setIsAdding((current) => !current)}
        >
          <Plus size={14} />
          Add Item
        </Button>
      </div>
      <Table className="table-fixed border-collapse">
        <colgroup>
          <col className="w-[3%]" /><col className="w-[8%]" />
          <col className="w-[9%]" /><col className="w-[14%]" />
          <col className="w-[5%]" /><col className="w-[5%]" />
          <col className="w-[7%]" /><col className="w-[6%]" />
          <col className="w-[8%]" /><col className="w-[8%]" />
          <col className="w-[6%]" /><col className="w-[8%]" />
          <col className="w-[9%]" /><col className="w-[4%]" />
        </colgroup>
        <TableHeader>
          <TableRow className="bg-gradient-to-b from-[#1c2331] to-[#111827] text-white">
            {COLUMNS.map((column) => (
              <TableHead key={column} className="truncate border-r border-slate-700/60 px-1.5 py-3 text-left text-[10px] font-semibold last:border-0">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.length === 0 && (
            <TableRow>
              <TableHead colSpan={14} className="h-24 text-center text-xs font-normal text-slate-500">
                Load a quotation or add an item to begin.
              </TableHead>
            </TableRow>
          )}
          {lines.map((line, index) => (
            <OrderItemRow
              key={line.localId}
              line={line}
              index={index}
              canDelete={lines.length > 1}
              onChange={(changes) => updateLine(line.localId, changes)}
              onDelete={() => removeLine(line.localId)}
            />
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
