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
  errors: Record<string, string>
  onAdd: () => void
  onRemove: (id: number) => void
  onUpdate: (id: number, field: PriceField, value: string) => void
}

export function PriceListTab({
  prices,
  units,
  errors,
  onAdd,
  onRemove,
  onUpdate,
}: PriceListTabProps) {
  function getErrorPath(row: PriceRow, rowIndex: number, field: string) {
    const unitIndex = units.findIndex((unit) => unit.unit === row.unit)
    const priceIndex = prices
      .slice(0, rowIndex)
      .filter((price) => price.unit === row.unit).length

    return unitIndex < 0
      ? undefined
      : errors[
          "units." +
            unitIndex +
            ".prices." +
            priceIndex +
            "." +
            field
        ]
  }

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
          {prices.map((row, index) => (
            <div
              key={row.id}
              className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_0.8fr_1fr_1fr_48px]"
            >
              <FormField
                label="Price List Type"
                error={getErrorPath(row, index, "price_list_type")}
                className="lg:[&>span:first-child]:hidden"
              >
                <SelectField
                  value={row.price_list_type}
                  onChange={(event) =>
                    onUpdate(
                      row.id,
                      "price_list_type",
                      event.target.value,
                    )
                  }
                >
                  <option>Retail</option>
                  <option>Wholesale</option>
                </SelectField>
              </FormField>
              <FormField
                label="Unit"
                className="lg:[&>span:first-child]:hidden"
              >
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
              <FormField
                label="Sale Price"
                error={getErrorPath(row, index, "sale_price")}
                className="lg:[&>span:first-child]:hidden"
              >
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.sale_price}
                  onChange={(event) =>
                    onUpdate(row.id, "sale_price", event.target.value)
                  }
                />
              </FormField>
              <FormField
                label="Minimum Selling Price"
                error={getErrorPath(
                  row,
                  index,
                  "minimum_selling_price",
                )}
                className="lg:[&>span:first-child]:hidden"
              >
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.minimum_selling_price}
                  onChange={(event) =>
                    onUpdate(
                      row.id,
                      "minimum_selling_price",
                      event.target.value,
                    )
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
