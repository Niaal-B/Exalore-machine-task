import { ChevronLeft, ChevronRight, FileText, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const COLUMNS = [
  "Quotation No",
  "Delivery Place",
  "Issue Date",
  "Customer Ref No",
  "Customer Code",
  "Customer Name",
  "Salesman Code",
  "NET",
]

const ROWS = [
  ["SQ-2026-0001", "Dubai", "18-06-2026", "PO-123", "CUST-001", "Al Noor Trading", "SE-001", "1250.00"],
  ["SQ-2026-0002", "Riyadh", "20-06-2026", "PO-145", "CUST-002", "Gulf Office Supplies", "SE-002", "2875.50"],
  ["SQ-2026-0003", "Dammam", "22-06-2026", "PO-162", "CUST-003", "Eastern Star LLC", "SE-001", "940.00"],
]

export function QuotationLookupDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Search Quotation"
          aria-label="Search Quotation"
          className="h-9 w-9 shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
        >
          <Search size={15} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl overflow-hidden">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600 text-white">
            <FileText size={17} />
          </div>
          <div>
            <DialogTitle>Sales Quotations</DialogTitle>
            <DialogDescription>Select a quotation to load</DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-4">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="bg-slate-50">
                  {COLUMNS.map((column, index) => (
                    <TableHead key={column} className={`px-2 pb-2 pt-3 text-left text-[10px] font-semibold uppercase text-slate-600 ${index === 5 ? "w-[18%]" : ""}`}>
                      <span className="mb-2 block truncate">{column}</span>
                      <Input
                        type={column === "Issue Date" ? "date" : "text"}
                        placeholder="Filter..."
                        className="h-8 bg-white px-2 text-[11px] font-normal normal-case"
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROWS.map((row) => (
                  <TableRow key={row[0]} className="border-t border-slate-100 hover:bg-indigo-50/50">
                    {row.map((value, index) => (
                      <TableCell key={`${row[0]}-${index}`} className={`truncate px-2 py-3 text-xs text-slate-700 ${index === 7 ? "text-right font-medium" : ""}`} title={value}>
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>Showing 1–3 of 3 quotations</span>
            <div className="flex items-center gap-1">
              <Button type="button" variant="outline" size="icon" className="h-8 w-8" disabled>
                <ChevronLeft size={14} />
              </Button>
              <Button type="button" className="h-8 w-8 bg-indigo-600 p-0 text-xs text-white">1</Button>
              <Button type="button" variant="outline" size="icon" className="h-8 w-8" disabled>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
