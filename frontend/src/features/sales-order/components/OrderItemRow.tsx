import { Trash2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import type { SalesOrderLine } from "@/features/sales-order/types/sales-order"

type OrderItemRowProps = {
  line: SalesOrderLine
  index: number
  canDelete: boolean
  onChange: (changes: Partial<SalesOrderLine>) => void
  onDelete: () => void
}

export function OrderItemRow({
  line,
  index,
  canDelete,
  onChange,
  onDelete,
}: OrderItemRowProps) {
  return (
    <TableRow className="border-b border-slate-100 hover:bg-slate-50/70">
      <TableCell className="px-1 py-1 text-center text-xs font-semibold text-indigo-700">
        {index + 1}
      </TableCell>
      {[line.itemCode, line.itemName, line.description, line.unit].map(
        (value, fieldIndex) => (
          <TableCell key={`${line.localId}-text-${fieldIndex}`} className="px-1 py-1">
            <Input
              readOnly
              value={value}
              title={value}
              className="h-8 w-full min-w-0 border-transparent bg-transparent px-1 text-[11px]"
            />
          </TableCell>
        ),
      )}
      <TableCell className="px-1 py-1">
        <Input
          type="number"
          min="1"
          step="1"
          value={line.quantity}
          className="h-8 w-full min-w-0 border-transparent bg-transparent px-1 text-right text-[11px]"
          onChange={(event) => {
            if (/^[1-9]\d*$/.test(event.target.value)) {
              onChange({ quantity: event.target.value })
            }
          }}
        />
      </TableCell>
      <TableCell className="px-1 py-1">
        <Input
          type="number"
          min="0"
          step="0.0001"
          value={line.rate}
          className="h-8 w-full min-w-0 border-transparent bg-transparent px-1 text-right text-[11px]"
          onChange={(event) => {
            const value = Number(event.target.value)
            if (event.target.value !== "" && value >= 0) {
              onChange({ rate: event.target.value })
            }
          }}
        />
      </TableCell>
      <TableCell className="px-1 py-1">
        <Input
          type="number"
          min="0"
          max="100"
          step="0.0001"
          value={line.discountPercentage}
          className="h-8 w-full min-w-0 border-transparent bg-transparent px-1 text-right text-[11px]"
          onChange={(event) => {
            const value = Number(event.target.value)
            if (event.target.value !== "" && value >= 0 && value <= 100) {
              onChange({ discountPercentage: event.target.value })
            }
          }}
        />
      </TableCell>
      {[
        line.discountAmount,
        line.netAmount,
        line.vatPercentage,
        line.vatAmount,
        line.netAfterVat,
      ].map((value, fieldIndex) => (
        <TableCell key={`${line.localId}-amount-${fieldIndex}`} className="px-1 py-1">
          <Input
            readOnly
            value={value}
            className="h-8 w-full min-w-0 border-transparent bg-transparent px-1 text-right text-[11px] text-slate-500"
          />
        </TableCell>
      ))}
      <TableCell className="px-1 py-1 text-center">
        <button
          type="button"
          disabled={!canDelete}
          aria-label={`Delete row ${index + 1}`}
          className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </button>
      </TableCell>
    </TableRow>
  )
}
