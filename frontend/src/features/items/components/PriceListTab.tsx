import { CirclePlus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField, SelectField } from "@/features/items/components/FormField"
import { FormSection } from "@/features/items/components/FormSection"
import type {
  PriceRow,
  UnitRow,
} from "@/features/items/types/item-form"

type PriceField = keyof Omit<PriceRow, "id">

type PriceListTabProps = {
  prices: PriceRow[]
  units: UnitRow[]
  onAdd: () => void
  onRemove: (id: number) => void
  onUpdate: (id: number, field: PriceField, value: string) => void
}

export function PriceListTab({
  prices,
  units,
  onAdd,
  onRemove,
  onUpdate,
}: PriceListTabProps) {
  return (
    <FormSection
      title="Price List"
      description="Maintain selling prices and minimum thresholds by unit"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {prices.length} price entries
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Minimum selling price cannot exceed the sale price.
          </p>
        </div>
        <Button type="button" size="sm" onClick={onAdd}>
          <CirclePlus size={15} /> Add price
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="hidden grid-cols-[1fr_0.8fr_1fr_1fr_48px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 lg:grid">
          <span>Price List Type</span>
          <span>Unit</span>
          <span>Sale Price</span>
          <span>Minimum Selling Price</span>
          <span />
        </div>
        <div className="divide-y divide-slate-100">
          {prices.map((row) => (
            <div
              key={row.id}
              className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_0.8fr_1fr_1fr_48px]"
            >
              <FormField
                label="Price List Type"
                className="lg:[&>span]:hidden"
              >
                <SelectField
                  value={row.priceListType}
                  onChange={(event) =>
                    onUpdate(row.id, "priceListType", event.target.value)
                  }
                >
                  <option>Retail</option>
                  <option>Wholesale</option>
                </SelectField>
              </FormField>
              <FormField label="Unit" className="lg:[&>span]:hidden">
                <SelectField
                  value={row.unit}
                  onChange={(event) =>
                    onUpdate(row.id, "unit", event.target.value)
                  }
                >
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.unit}>
                      {unit.unit || "New unit"}
                    </option>
                  ))}
                </SelectField>
              </FormField>
              <FormField label="Sale Price" className="lg:[&>span]:hidden">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.salePrice}
                  onChange={(event) =>
                    onUpdate(row.id, "salePrice", event.target.value)
                  }
                />
              </FormField>
              <FormField
                label="Minimum Selling Price"
                className="lg:[&>span]:hidden"
              >
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.minimumPrice}
                  onChange={(event) =>
                    onUpdate(row.id, "minimumPrice", event.target.value)
                  }
                />
              </FormField>
              <Button
                type="button"
                size="icon"
                variant="danger"
                className="self-end"
                onClick={() => onRemove(row.id)}
                aria-label="Remove price"
              >
                <Trash2 size={15} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </FormSection>
  )
}
