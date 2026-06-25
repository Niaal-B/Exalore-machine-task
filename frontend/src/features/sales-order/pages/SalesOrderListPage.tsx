import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import { EntityListPage } from "@/features/entity-list/components/EntityListPage"
import { getPrintTemplate } from "@/features/print-settings/services/printTemplateService"
import { savedSalesOrderDocument } from "@/features/sales-documents/mappers/printableDocumentMappers"
import { printSalesDocument } from "@/features/sales-documents/utils/printSalesDocument"
import { listSalesOrders } from "@/features/sales-order/services/salesOrderService"
import type { CreateSalesOrderResponse } from "@/features/sales-order/types/createSalesOrderResponse"

const COLUMNS = ["Sales Order No", "Issue Date", "Quotation", "Customer Code", "Customer Name", "Currency", "Net After VAT", "Status", "PDF"]

export function SalesOrderListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [records, setRecords] = useState<CreateSalesOrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  async function printSalesOrderPdf(record: CreateSalesOrderResponse) {
    try {
      const template = await getPrintTemplate()
      printSalesDocument({
        ...savedSalesOrderDocument(record),
        template: {
          headerImageUrl: template.headerImageUrl,
          footerImageUrl: template.footerImageUrl,
          primaryColor: template.primaryColor,
        },
      })
    } catch {
      printSalesDocument(savedSalesOrderDocument(record))
    }
  }

  useEffect(() => {
    let current = true
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      setError("")
      try {
        const result = await listSalesOrders({ search: search.trim() || undefined, status: status || undefined, ordering: "-issue_date" })
        if (current) setRecords(result)
      } catch {
        if (current) setError("Unable to load sales orders.")
      } finally {
        if (current) setIsLoading(false)
      }
    }, 300)
    return () => { current = false; window.clearTimeout(timeout) }
  }, [search, status])

  return (
    <EntityListPage title="Sales Orders" description="Browse manual and quotation-linked sales orders." newHref="/sales-orders/new" searchPlaceholder="Search sales order number or customer" search={search} onSearchChange={setSearch}
      filters={<Select value={status} className="h-9 w-40 text-xs" onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="draft">Draft</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></Select>}
      columns={COLUMNS} isLoading={isLoading} error={error} isEmpty={records.length === 0} resultCount={records.length}>
      {records.map((record) => (
        <TableRow
          key={record.id}
          className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
          onClick={() => navigate(`/sales-orders/new?id=${record.id}`)}
        >
          {[record.sales_order_no, record.issue_date, record.quotation_id?.toString() ?? "Manual", record.customer_code, record.customer_name, record.currency, record.net_after_vat, record.status].map((value, index) => (
            <TableCell key={`${record.id}-${index}`} className={`whitespace-nowrap px-4 py-3 text-xs text-slate-700 ${index === 6 ? "text-right font-semibold" : ""}`}>{value}</TableCell>
          ))}
          <TableCell className="px-4 py-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs text-indigo-700"
              onClick={(event) => {
                event.stopPropagation()
                void printSalesOrderPdf(record)
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
