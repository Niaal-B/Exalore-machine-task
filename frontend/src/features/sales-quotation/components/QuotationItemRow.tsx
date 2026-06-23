import { Input } from "@/components/ui/input"
import { SelectField } from "@/features/items/components/FormField"
import type { QuotationLine } from "@/features/sales-quotation/types/quotation"
import { Search } from "lucide-react"

interface QuotationItemRowProps {
  row: QuotationLine
  index: number
}

export function QuotationItemRow({ row, index }: QuotationItemRowProps) {
  return (
    <tr className="group border-b border-slate-100 hover:bg-slate-50/60 last:border-0">
      {/* # Row */}
      <td className="px-2 py-1 text-center">
        <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-xs font-medium text-indigo-700">
          {index + 1}
        </div>
      </td>

      {/* Code */}
      <td className="px-1 py-1">
        <div className="relative">
          <Input
            className="h-8 pr-7 text-xs border-transparent hover:border-slate-200 focus:border-indigo-400 bg-transparent"
            defaultValue={row.itemCode}
            readOnly
          />
          <Search className="absolute right-2 top-2 h-4 w-4 text-slate-300" />
        </div>
      </td>

      {/* Description */}
      <td className="px-1 py-1">
        <div className="relative">
          <Input
            className="h-8 pr-7 text-xs border-transparent hover:border-slate-200 focus:border-indigo-400 bg-transparent"
            defaultValue={row.itemName}
            readOnly
          />
          <Search className="absolute right-2 top-2 h-4 w-4 text-slate-300" />
        </div>
      </td>

      {/* Unit */}
      <td className="px-1 py-1">
        <SelectField
          className="h-8 text-xs border-transparent bg-transparent hover:border-slate-200 focus:border-indigo-400"
          defaultValue={row.unit}
        >
          <option value={row.unit}>{row.unit}</option>
        </SelectField>
      </td>

      {/* Qty */}
      <td className="px-1 py-1">
        <Input
          type="number"
          className="h-8 text-right text-xs border-transparent bg-transparent hover:border-slate-200 focus:border-indigo-400"
          defaultValue={parseFloat(row.quantity)}
        />
      </td>

      {/* Rate */}
      <td className="px-1 py-1">
        <Input
          type="number"
          className="h-8 text-right text-xs border-transparent bg-transparent hover:border-slate-200 focus:border-indigo-400"
          defaultValue={parseFloat(row.rate)}
        />
      </td>

      {/* Disc % */}
      <td className="px-1 py-1">
        <Input
          type="number"
          className="h-8 text-right text-xs border-transparent bg-transparent hover:border-slate-200 focus:border-indigo-400"
          defaultValue={parseFloat(row.discountPercentage)}
        />
      </td>

      {/* Disc Amt */}
      <td className="px-1 py-1">
        <Input
          className="h-8 text-right text-xs border-transparent bg-transparent text-slate-500"
          value={parseFloat(row.discountAmount).toFixed(2)}
          readOnly
        />
      </td>

      {/* NET */}
      <td className="px-1 py-1">
        <Input
          className="h-8 text-right text-xs border-transparent bg-transparent text-slate-500"
          value={parseFloat(row.netAmount).toFixed(2)}
          readOnly
        />
      </td>

      {/* VAT */}
      <td className="px-1 py-1">
        <Input
          className="h-8 text-right text-xs border-transparent bg-transparent text-slate-500"
          value={parseFloat(row.vatAmount).toFixed(2)}
          readOnly
        />
      </td>

      {/* Net After VAT */}
      <td className="px-1 py-1">
        <Input
          className="h-8 text-right text-xs border-transparent bg-transparent font-medium text-slate-700"
          value={parseFloat(row.netAfterVat).toFixed(2)}
          readOnly
        />
      </td>
    </tr>
  )
}
