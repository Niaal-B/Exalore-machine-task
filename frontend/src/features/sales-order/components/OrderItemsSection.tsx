import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderItemRow } from "@/features/sales-order/components/OrderItemRow"
import type { SalesOrderLine } from "@/features/sales-order/types/sales-order"

const COLUMNS = [
  "#",
  "Item Code",
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

export function OrderItemsSection({ lines }: { lines: SalesOrderLine[] }) {
  return (
    <section className="min-h-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
        Static order-line preview
      </div>
      <Table className="table-fixed border-collapse">
        <colgroup>
          <col className="w-[3%]" /><col className="w-[10%]" />
          <col className="w-[18%]" /><col className="w-[6%]" />
          <col className="w-[5%]" /><col className="w-[7%]" />
          <col className="w-[6%]" /><col className="w-[8%]" />
          <col className="w-[8%]" /><col className="w-[6%]" />
          <col className="w-[8%]" /><col className="w-[10%]" />
          <col className="w-[5%]" />
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
          {lines.map((line) => <OrderItemRow key={line.id} line={line} />)}
        </TableBody>
      </Table>
    </section>
  )
}
