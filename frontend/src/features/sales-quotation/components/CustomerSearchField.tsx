import { LoaderCircle, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { searchCustomers } from "@/features/sales-quotation/services/customerService"
import type { Customer } from "@/features/sales-quotation/types/customer"

type CustomerSearchFieldProps = {
  selectedCustomer?: Customer
  onSelect: (customer: Customer) => void
  onClear: () => void
}

export function CustomerSearchField({
  selectedCustomer,
  onSelect,
  onClear,
}: CustomerSearchFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (selectedCustomer) {
      setQuery(`${selectedCustomer.code} - ${selectedCustomer.name}`)
    }
  }, [selectedCustomer?.id, selectedCustomer?.code, selectedCustomer?.name])

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [])

  useEffect(() => {
    const search = query.trim()
    if (!isOpen || selectedCustomer || search.length < 1) {
      setCustomers([])
      setIsLoading(false)
      setError("")
      return
    }

    let isCurrent = true
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      setError("")

      try {
        const results = await searchCustomers(search)
        if (isCurrent) setCustomers(results)
      } catch {
        if (isCurrent) {
          setCustomers([])
          setError("Unable to load customers. Please try again.")
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }, 300)

    return () => {
      isCurrent = false
      window.clearTimeout(timeout)
    }
  }, [query, isOpen, selectedCustomer])

  function handleQueryChange(value: string) {
    if (selectedCustomer) onClear()
    setQuery(value)
    setIsOpen(true)
  }

  function handleSelect(customer: Customer) {
    onSelect(customer)
    setQuery(`${customer.code} - ${customer.name}`)
    setIsOpen(false)
  }

  const showNoResults =
    isOpen &&
    query.trim().length > 0 &&
    !isLoading &&
    !error &&
    customers.length === 0 &&
    !selectedCustomer

  return (
    <div ref={containerRef} className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
        size={14}
      />
      <Input
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="customer-search-results"
        autoComplete="off"
        value={query}
        placeholder="Search by code or name"
        className="h-9 pl-9 pr-9 text-xs"
        onFocus={() => setIsOpen(true)}
        onChange={(event) => handleQueryChange(event.target.value)}
      />
      {isLoading && (
        <LoaderCircle
          aria-label="Searching customers"
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-500"
          size={14}
        />
      )}

      {isOpen && query.trim() && !selectedCustomer && (
        <div
          id="customer-search-results"
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
        >
          {error && (
            <p className="px-3 py-2 text-xs text-rose-600">{error}</p>
          )}
          {showNoResults && (
            <p className="px-3 py-2 text-xs text-slate-500">
              No customers found.
            </p>
          )}
          {customers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              role="option"
              className="block w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(customer)}
            >
              <span className="font-semibold">{customer.code}</span>
              {" - "}
              {customer.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
