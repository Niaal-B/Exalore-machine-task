import { ChevronLeft, ChevronRight, FileText, LoaderCircle, Search } from "lucide-react"
import { useEffect, useState } from "react"

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
import {
  getQuotationDetail,
  searchQuotations,
} from "@/features/sales-order/services/quotationSearchService"
import type { QuotationDetail } from "@/features/sales-order/types/quotation-detail"
import type { QuotationSearchResult } from "@/features/sales-order/types/quotation-search"

const COLUMNS = [
  "Quotation No",
  "Delivery Place",
  "Issue Date",
  "Customer Ref No",
  "Customer Code",
  "Customer Name",
  "Sales Executive",
  "Net Amount",
]

type QuotationLookupDialogProps = {
  onSelect: (quotation: QuotationDetail) => void
}

export function QuotationLookupDialog({
  onSelect,
}: QuotationLookupDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [quotations, setQuotations] = useState<QuotationSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loadingId, setLoadingId] = useState<number>()
  const [error, setError] = useState("")

  useEffect(() => {
    const search = query.trim()
    if (!isOpen || search.length === 0) return

    let isCurrent = true
    const timeout = window.setTimeout(async () => {
      setIsSearching(true)
      setError("")
      try {
        const results = await searchQuotations(search)
        if (isCurrent) setQuotations(results)
      } catch {
        if (isCurrent) {
          setQuotations([])
          setError("Unable to search quotations. Please try again.")
        }
      } finally {
        if (isCurrent) setIsSearching(false)
      }
    }, 300)

    return () => {
      isCurrent = false
      window.clearTimeout(timeout)
    }
  }, [isOpen, query])

  function changeQuery(value: string) {
    setQuery(value)
    setError("")
    if (value.trim().length === 0) setQuotations([])
  }

  async function selectQuotation(id: number) {
    setLoadingId(id)
    setError("")
    try {
      const quotation = await getQuotationDetail(id)
      onSelect(quotation)
      setIsOpen(false)
    } catch {
      setError("Unable to load the selected quotation.")
    } finally {
      setLoadingId(undefined)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          {error && (
            <div role="alert" className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="bg-slate-50">
                  {COLUMNS.map((column, index) => (
                    <TableHead key={column} className={`px-2 pb-2 pt-3 text-left text-[10px] font-semibold uppercase text-slate-600 ${index === 5 ? "w-[18%]" : ""}`}>
                      <span className="mb-2 block truncate">{column}</span>
                      <Input
                        type={column === "Issue Date" ? "date" : "text"}
                        value={index === 0 ? query : ""}
                        readOnly={index !== 0}
                        placeholder="Filter..."
                        className="h-8 bg-white px-2 text-[11px] font-normal normal-case"
                        onChange={index === 0 ? (event) => changeQuery(event.target.value) : undefined}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isSearching && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-xs text-slate-500">
                      <LoaderCircle className="mr-2 inline animate-spin" size={15} />
                      Searching quotations...
                    </TableCell>
                  </TableRow>
                )}
                {!isSearching && query.trim().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-xs text-slate-500">
                      Enter a quotation number or customer name to search.
                    </TableCell>
                  </TableRow>
                )}
                {!isSearching && query.trim() && quotations.length === 0 && !error && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-xs text-slate-500">
                      No quotations found.
                    </TableCell>
                  </TableRow>
                )}
                {!isSearching && quotations.map((quotation) => {
                  const values = [
                    quotation.quotationNo,
                    quotation.deliveryPlace,
                    quotation.issueDate,
                    quotation.customerRefNo,
                    quotation.customerCode,
                    quotation.customerName,
                    quotation.salesExecutive,
                    quotation.netAmount,
                  ]
                  return (
                    <TableRow
                      key={quotation.id}
                      tabIndex={0}
                      className="cursor-pointer border-t border-slate-100 hover:bg-indigo-50"
                      onClick={() => selectQuotation(quotation.id)}
                    >
                      {values.map((value, index) => (
                        <TableCell key={`${quotation.id}-${index}`} className={`truncate px-2 py-3 text-xs text-slate-700 ${index === 7 ? "text-right font-medium" : ""}`} title={value}>
                          {loadingId === quotation.id && index === 0 ? (
                            <LoaderCircle className="inline animate-spin" size={14} />
                          ) : value}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>{quotations.length} quotation(s)</span>
            <div className="flex items-center gap-1">
              <Button type="button" variant="outline" size="icon" className="h-8 w-8" disabled><ChevronLeft size={14} /></Button>
              <Button type="button" className="h-8 w-8 bg-indigo-600 p-0 text-xs text-white">1</Button>
              <Button type="button" variant="outline" size="icon" className="h-8 w-8" disabled><ChevronRight size={14} /></Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
