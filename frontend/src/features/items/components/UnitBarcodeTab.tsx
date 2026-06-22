import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField, SelectField } from "@/features/items/components/FormField"
import { FormSection } from "@/features/items/components/FormSection"
import type { UnitRow } from "@/features/items/types/item-form"

type UnitField = keyof Omit<UnitRow, "id">

type UnitBarcodeTabProps = {
  units: UnitRow[]
  errors: Record<string, string>
  onAdd: () => void
  onRemove: (id: number) => void
  onUpdate: (id: number, field: UnitField, value: string) => void
}

export function UnitBarcodeTab({
  units,
  errors,
  onAdd,
  onRemove,
  onUpdate,
}: UnitBarcodeTabProps) {
  const defaultUnit = units[0]?.unit || ""

  return (
    <FormSection
      title="Unit & Barcode Management"
      description="Configure sale packages and stock conversion factors"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {units.length} configured units
          </p>
          <p className="mt-1 text-xs text-slate-400">
            The base stock unit should use a conversion factor of 1.
          </p>
        </div>
        <Button type="button" size="sm" onClick={onAdd}>
          <Plus size={15} /> Add unit
        </Button>
      </div>

      {errors.units && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
          {errors.units}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="hidden grid-cols-[1.1fr_0.7fr_1.5fr_48px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 md:grid">
          <span>Unit</span>
          <span>Co Factor</span>
          <span>Barcode</span>
          <span />
        </div>
        <div className="divide-y divide-slate-100">
          {units.map((row, index) => {
            const prefix = "units." + index
            return (
              <div
                key={row.id}
                className="grid gap-3 p-4 md:grid-cols-[1.1fr_0.7fr_1.5fr_48px]"
              >
                <FormField
                  label="Unit"
                  error={errors[prefix + ".unit"]}
                  className="md:[&>span:first-child]:hidden"
                >
                  <Input
                    value={row.unit}
                    placeholder="e.g. Pcs"
                    onChange={(event) =>
                      onUpdate(row.id, "unit", event.target.value)
                    }
                  />
                </FormField>
                <FormField
                  label="Co Factor"
                  error={errors[prefix + ".co_factor"]}
                  className="md:[&>span:first-child]:hidden"
                >
                  <Input
                    type="number"
                    min="0.000001"
                    step="0.000001"
                    value={row.co_factor}
                    onChange={(event) =>
                      onUpdate(row.id, "co_factor", event.target.value)
                    }
                  />
                </FormField>
                <FormField
                  label="Barcode"
                  error={errors[prefix + ".barcode"]}
                  className="md:[&>span:first-child]:hidden"
                >
                  <Input
                    value={row.barcode}
                    placeholder="Scan or enter barcode"
                    onChange={(event) =>
                      onUpdate(row.id, "barcode", event.target.value)
                    }
                  />
                </FormField>
                <Button
                  type="button"
                  size="icon"
                  variant="danger"
                  className="self-end"
                  onClick={() => onRemove(row.id)}
                  aria-label="Remove unit"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 md:grid-cols-2">
        <FormField label="Default Sales Unit">
          <SelectField defaultValue={defaultUnit}>
            {units.map((unit) => (
              <option key={unit.id} value={unit.unit}>
                {unit.unit || "New unit"}
              </option>
            ))}
          </SelectField>
        </FormField>
        <FormField label="Stock Unit">
          <SelectField defaultValue={defaultUnit}>
            {units.map((unit) => (
              <option key={unit.id} value={unit.unit}>
                {unit.unit || "New unit"}
              </option>
            ))}
          </SelectField>
        </FormField>
      </div>
    </FormSection>
  )
}
