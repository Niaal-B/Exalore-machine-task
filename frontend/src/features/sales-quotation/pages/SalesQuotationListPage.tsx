import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import { EntityListPage } from "@/features/entity-list/components/EntityListPage"
import { savedQuotationDocument } from "@/features/sales-documents/mappers/printableDocumentMappers"
import { printSalesDocument } from "@/features/sales-documents/utils/printSalesDocument"
import { listQuotations } from "@/features/sales-quotation/services/quotationService"
import type { CreateQuotationResponse } from "@/features/sales-quotation/types/createQuotationResponse"

const COLUMNS = ["Quotation No", "Date", "Customer Code", "Customer Name", "Currency", "Net After VAT", "Status", "PDF"]

export function SalesQuotationListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [records, setRecords] = useState<CreateQuotationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let current = true
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      setError("")
      try {
        const result = await listQuotations({ search: search.trim() || undefined, status: status || undefined, ordering: "-quotation_date" })
        if (current) setRecords(result)
      } catch {
        if (current) setError("Unable to load sales quotations.")
      } finally {
        if (current) setIsLoading(false)
      }
    }, 300)
    return () => { current = false; window.clearTimeout(timeout) }
  }, [search, status])

  return (
    <EntityListPage title="Sales Quotations" description="Review created quotations and their current status." newHref="/sales-quotations/new" searchPlaceholder="Search quotation number or customer" search={search} onSearchChange={setSearch}
      filters={<Select value={status} className="h-9 w-40 text-xs" onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="draft">Draft</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></Select>}
      columns={COLUMNS} isLoading={isLoading} error={error} isEmpty={records.length === 0} resultCount={records.length}>
      {records.map((record) => (
        <TableRow
          key={record.id}
          className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
          onClick={() => navigate(`/sales-quotations/new?id=${record.id}`)}
        >
          {[record.quotation_no, record.quotation_date, record.customer_code, record.customer_name, record.currency, record.net_after_vat, record.status].map((value, index) => (
            <TableCell key={`${record.id}-${index}`} className={`whitespace-nowrap px-4 py-3 text-xs text-slate-700 ${index === 5 ? "text-right font-semibold" : ""}`}>{value}</TableCell>
          ))}
          <TableCell className="px-4 py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs text-indigo-700"
              onClick={(event) => {
                event.stopPropagation()
                printSalesDocument(savedQuotationDocument(record))
              }}
            >
              <Download size={13} /> PDF
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </EntityListPage>
  )
}
