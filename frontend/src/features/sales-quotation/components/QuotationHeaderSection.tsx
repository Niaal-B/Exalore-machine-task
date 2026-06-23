import { Input } from "@/components/ui/input"
import { SelectField } from "@/features/items/components/FormField"
import { FormField } from "@/features/items/components/FormField"

export function QuotationHeaderSection() {
  return (
    <section>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-3">
        {/* Row 1 */}
        <FormField label="Quotation No">
          <Input readOnly className="bg-slate-50 text-slate-500 h-9 text-xs" />
        </FormField>
        <FormField label="Sales Quotation Type">
          <SelectField className="h-9 text-xs text-slate-400" defaultValue="">
            <option value="" disabled>Select quotation type</option>
            <option value="1">Standard</option>
          </SelectField>
        </FormField>
        <FormField label="Date">
          <Input type="date" defaultValue="2026-06-18" className="h-9 text-xs" />
        </FormField>
        <FormField label="Customer Search">
          <Input placeholder="Customer Search" className="h-9 text-xs" />
        </FormField>
        <FormField label="Cus.Ref.Num">
          <Input placeholder="" className="h-9 text-xs" />
        </FormField>
        <FormField label="Sales Executive">
          <SelectField className="h-9 text-xs text-slate-400" defaultValue="">
            <option value="" disabled>Select Sales Executive</option>
            <option value="1">Ahmed Al-Farsi</option>
          </SelectField>
        </FormField>

        {/* Row 2 */}
        <FormField label="Attention">
          <Input placeholder="" className="h-9 text-xs" />
        </FormField>
        <FormField label="Pay Terms">
          <Input placeholder="" className="h-9 text-xs" />
        </FormField>
        <FormField label="Delivery Place">
          <Input placeholder="" className="h-9 text-xs" />
        </FormField>
        <FormField label="Currency">
          <SelectField defaultValue="SAR" className="h-9 text-xs">
            <option value="SAR">1 - SAUDI RIYAL</option>
          </SelectField>
        </FormField>
        <FormField label="Ex Rate">
          <Input type="number" defaultValue="1" className="h-9 text-xs" />
        </FormField>
        <FormField label="Notes">
          <textarea
            rows={1}
            placeholder="Notes"
            className="input-base h-9 resize-none py-2 text-xs"
          />
        </FormField>
      </div>
    </section>
  )
}
