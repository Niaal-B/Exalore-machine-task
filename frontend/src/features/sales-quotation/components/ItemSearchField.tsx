import { LoaderCircle, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { Input } from "@/components/ui/input"
import { searchItems } from "@/features/sales-quotation/services/itemSearchService"
import type { ItemSearchResult } from "@/features/sales-quotation/types/quotation-line"

type ItemSearchFieldProps = {
  value: string
  onSelect: (item: ItemSearchResult) => void
  onClear: () => void
}

export function ItemSearchField({
  value,
  onSelect,
  onClear,
}: ItemSearchFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState(value)
  const [items, setItems] = useState<ItemSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [menuPosition, setMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 320,
  })

  useEffect(() => setQuery(value), [value])

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      if (
        !containerRef.current?.contains(target) &&
        !resultsRef.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    function positionMenu() {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const width = Math.max(320, rect.width)
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
      const spaceBelow = window.innerHeight - rect.bottom
      const top = spaceBelow >= 240 ? rect.bottom + 4 : Math.max(8, rect.top - 228)

      setMenuPosition({ left, top, width })
    }

    positionMenu()
    window.addEventListener("resize", positionMenu)
    window.addEventListener("scroll", positionMenu, true)
    return () => {
      window.removeEventListener("resize", positionMenu)
      window.removeEventListener("scroll", positionMenu, true)
    }
  }, [isOpen])

  useEffect(() => {
    const search = query.trim()
    if (!isOpen || search.length < 1 || search === value) {
      setItems([])
      setIsLoading(false)
      setError("")
      return
    }

    let isCurrent = true
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      setError("")
      try {
        const results = await searchItems(search)
        if (isCurrent) setItems(results)
      } catch {
        if (isCurrent) {
          setItems([])
          setError("Unable to load items. Please try again.")
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }, 300)

    return () => {
      isCurrent = false
      window.clearTimeout(timeout)
    }
  }, [isOpen, query, value])

  function changeQuery(nextValue: string) {
    if (value) onClear()
    setQuery(nextValue)
    setIsOpen(true)
  }

  function selectItem(item: ItemSearchResult) {
    onSelect(item)
    setQuery(item.itemCode)
    setIsOpen(false)
  }

  const showNoResults =
    isOpen && query.trim() && query !== value && !isLoading && !error && items.length === 0

  return (
    <div ref={containerRef} className="relative min-w-0 w-full">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2 text-slate-400"
        size={14}
      />
      <Input
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="item-search-results"
        autoComplete="off"
        value={query}
        placeholder="Search item"
        className="h-8 border-transparent bg-transparent pl-7 pr-7 text-xs"
        onFocus={() => setIsOpen(true)}
        onChange={(event) => changeQuery(event.target.value)}
      />
      {isLoading && (
        <LoaderCircle
          aria-label="Searching items"
          className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-indigo-500"
          size={14}
        />
      )}

      {isOpen && query.trim() && query !== value && createPortal(
        <div
          ref={resultsRef}
          id="item-search-results"
          role="listbox"
          className="fixed z-[100] max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
          style={menuPosition}
        >
          {error && <p className="px-3 py-2 text-xs text-rose-600">{error}</p>}
          {showNoResults && (
            <p className="px-3 py-2 text-xs text-slate-500">No items found.</p>
          )}
          {items.map((item) => (
            <button
              key={item.itemUnitId}
              type="button"
              role="option"
              className="block w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectItem(item)}
            >
              <span className="font-semibold">{item.itemCode}</span>
              {` - ${item.itemName} (${item.unit})`}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
