import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { LoaderCircle, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type EntityListPageProps = {
  title: string
  description: string
  newHref: string
  searchPlaceholder: string
  search: string
  onSearchChange: (value: string) => void
  filters?: ReactNode
  columns: string[]
  isLoading: boolean
  error: string
  isEmpty: boolean
  resultCount: number
  children: ReactNode
}

export function EntityListPage({
  title,
  description,
  newHref,
  searchPlaceholder,
  search,
  onSearchChange,
  filters,
  columns,
  isLoading,
  error,
  isEmpty,
  resultCount,
  children,
}: EntityListPageProps) {
  return (
    <div className="min-w-0 space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <Button asChild size="sm">
          <Link to={newHref}><Plus size={14} /> New</Link>
        </Button>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <Input
              value={search}
              placeholder={searchPlaceholder}
              className="h-9 pl-9 text-xs"
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          {filters}
        </div>

        {error && <div role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-900 text-white">
                {columns.map((column) => (
                  <TableHead key={column} className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableHead colSpan={columns.length} className="h-32 text-center text-xs font-normal text-slate-500"><LoaderCircle className="mr-2 inline animate-spin" size={15} />Loading records...</TableHead></TableRow>
              )}
              {!isLoading && isEmpty && (
                <TableRow><TableHead colSpan={columns.length} className="h-32 text-center text-xs font-normal text-slate-500">No matching records found.</TableHead></TableRow>
              )}
              {!isLoading && children}
            </TableBody>
          </Table>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <span>{resultCount} record(s)</span>
          <span className="rounded-md bg-indigo-600 px-3 py-1.5 font-semibold text-white">1</span>
        </footer>
      </section>
    </div>
  )
}
