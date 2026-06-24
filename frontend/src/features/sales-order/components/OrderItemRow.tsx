import { Trash2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import type { SalesOrderLine } from "@/features/sales-order/types/sales-order"

export function OrderItemRow({ line }: { line: SalesOrderLine }) {
  const values = [
    line.itemCode,
    line.description,
    line.unit,
    line.quantity,
    line.rate,
    line.discountPercentage,
    line.discountAmount,
    line.netAmount,
    line.vatPercentage,
    line.vatAmount,
    line.netAfterVat,
  ]

  return (
    <TableRow className="border-b border-slate-100 hover:bg-slate-50/70">
      <TableCell className="px-1 py-1 text-center text-xs font-semibold text-indigo-700">
        {line.id}
      </TableCell>
      {values.map((value, index) => (
        <TableCell key={`${line.id}-${index}`} className="px-1 py-1">
          <Input
            readOnly
            title={value}
            defaultValue={value}
            className={`h-8 w-full min-w-0 border-transparent bg-transparent px-1 text-[11px] ${
              index >= 3 ? "text-right" : ""
            }`}
          />
        </TableCell>
      ))}
      <TableCell className="px-1 py-1 text-center">
        <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
          <Trash2 size={14} />
        </button>
      </TableCell>
    </TableRow>
  )
}
