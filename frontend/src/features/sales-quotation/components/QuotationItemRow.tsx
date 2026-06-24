import { Trash2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ItemSearchField } from "@/features/sales-quotation/components/ItemSearchField"
import type {
  ItemSearchResult,
  QuotationLine,
} from "@/features/sales-quotation/types/quotation-line"

type QuotationItemRowProps = {
  row: QuotationLine
  index: number
  canDelete: boolean
  onChange: (changes: Partial<QuotationLine>) => void
  onItemSelect: (item: ItemSearchResult) => void
  onDelete: () => void
}

export function QuotationItemRow({
  row,
  index,
  canDelete,
  onChange,
  onItemSelect,
  onDelete,
}: QuotationItemRowProps) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 last:border-0">
      <td className="px-2 py-1 text-center">
        <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-xs font-medium text-indigo-700">
          {index + 1}
        </div>
      </td>
      <td className="px-1 py-1">
        <ItemSearchField
          value={row.itemCode}
          onSelect={onItemSelect}
          onClear={() =>
            onChange({
              itemUnitId: undefined,
              itemCode: "",
              itemName: "",
              description: "",
              unit: "",
              rate: "0",
              defaultRate: undefined,
              vatPercentage: "0",
            })
          }
        />
      </td>
      <td className="px-1 py-1">
        <Input
          value={row.itemName}
          title={row.itemName}
          readOnly
          className="h-8 w-full min-w-0 border-transparent bg-transparent px-1.5 text-[11px]"
        />
      </td>
      <td className="px-1 py-1">
        <Input
          value={row.description}
          title={row.description}
          readOnly
          className="h-8 w-full min-w-0 border-transparent bg-transparent px-1.5 text-[11px]"
        />
      </td>
      <td className="px-1 py-1">
        <Input value={row.unit} readOnly className="h-8 w-full min-w-0 border-transparent bg-transparent px-1 text-[11px]" />
      </td>
      <td className="px-1 py-1">
        <Input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={row.quantity}
          className="h-8 w-full min-w-0 border-transparent bg-transparent px-1 text-right text-[11px]"
          onChange={(event) => {
            const quantity = event.target.value
            if (quantity === "" || /^\d+$/.test(quantity)) {
              onChange({ quantity })
            }
          }}
        />
      </td>
      {(["rate", "discountPercentage"] as const).map((field) => (
        <td key={field} className="px-1 py-1">
          <Input
            type="number"
            min="0"
            step="0.0001"
            value={row[field]}
            className="h-8 w-full min-w-0 border-transparent bg-transparent px-1 text-right text-[11px]"
            onChange={(event) => onChange({ [field]: event.target.value })}
          />
        </td>
      ))}
      {(["discountAmount", "netAmount", "vatAmount", "netAfterVat"] as const).map(
        (field) => (
          <td key={field} className="px-1 py-1">
            <Input
              value={row[field]}
              readOnly
              className="h-8 w-full min-w-0 border-transparent bg-transparent px-1 text-right text-[11px] text-slate-500"
            />
          </td>
        ),
      )}
      <td className="px-1 py-1 text-center">
        <button
          type="button"
          disabled={!canDelete}
          aria-label={`Delete row ${index + 1}`}
          className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  )
}
