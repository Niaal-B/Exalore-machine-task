import { useEffect, useState } from "react"

import { Select } from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import { EntityListPage } from "@/features/entity-list/components/EntityListPage"
import { listItems } from "@/features/items/api/itemApi"
import type { ItemListRecord } from "@/features/items/types/item-list"

const COLUMNS = ["Code", "Name", "Generic Name", "Behaviour", "Group", "Status", "Tax", "Manufacturer"]

export function ItemListPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [items, setItems] = useState<ItemListRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let current = true
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      setError("")
      try {
        const result = await listItems({ search: search.trim() || undefined, status: status || undefined, ordering: "code" })
        if (current) setItems(result)
      } catch {
        if (current) setError("Unable to load items.")
      } finally {
        if (current) setIsLoading(false)
      }
    }, 300)
    return () => { current = false; window.clearTimeout(timeout) }
  }, [search, status])

  return (
    <EntityListPage title="Items" description="Browse and search item master records." newHref="/items/new" searchPlaceholder="Search code, name, secondary or generic name" search={search} onSearchChange={setSearch}
      filters={<Select value={status} className="h-9 w-40 text-xs" onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></Select>}
      columns={COLUMNS} isLoading={isLoading} error={error} isEmpty={items.length === 0} resultCount={items.length}>
      {items.map((item) => (
        <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
          {[item.code, item.name, item.generic_name || "—", item.behaviour, item.group_code || "—", item.status, item.tax_status, item.manufacturer || "—"].map((value, index) => (
            <TableCell key={`${item.id}-${index}`} className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">{value}</TableCell>
          ))}
        </TableRow>
      ))}
    </EntityListPage>
  )
}
