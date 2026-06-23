import { Input } from "@/components/ui/input"
import { FormField, SelectField } from "@/features/items/components/FormField"
import { CustomerSearchField } from "@/features/sales-quotation/components/CustomerSearchField"
import type { Customer } from "@/features/sales-quotation/types/customer"
import type { QuotationForm } from "@/features/sales-quotation/types/quotation"

type QuotationHeaderSectionProps = {
  values: QuotationForm
  selectedCustomer?: Customer
  onChange: (changes: Partial<QuotationForm>) => void
  onCustomerSelect: (customer: Customer) => void
  onCustomerClear: () => void
}

export function QuotationHeaderSection({
  values,
  selectedCustomer,
  onChange,
  onCustomerSelect,
  onCustomerClear,
}: QuotationHeaderSectionProps) {
  return (
    <section>
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <FormField label="Quotation No">
          <Input
            readOnly
            value=""
            placeholder="Generated on save"
            className="h-9 bg-slate-50 text-xs text-slate-500"
          />
        </FormField>
        <FormField label="Sales Quotation Type">
          <SelectField className="h-9 text-xs" defaultValue="standard">
            <option value="standard">Standard</option>
          </SelectField>
        </FormField>
        <FormField label="Date">
          <Input
            type="date"
            value={values.quotationDate}
            className="h-9 text-xs"
            onChange={(event) =>
              onChange({ quotationDate: event.target.value })
            }
          />
        </FormField>
        <FormField label="Customer Search">
          <CustomerSearchField
            selectedCustomer={selectedCustomer}
            onSelect={onCustomerSelect}
            onClear={onCustomerClear}
          />
        </FormField>
        <FormField label="Customer Code">
          <Input
            readOnly
            value={values.customerCode}
            className="h-9 bg-slate-50 text-xs"
          />
        </FormField>
        <FormField label="Customer Name">
          <Input
            readOnly
            value={values.customerName}
            className="h-9 bg-slate-50 text-xs"
          />
        </FormField>

        <FormField label="Cus.Ref.Num">
          <Input
            value={values.customerRefNo}
            className="h-9 text-xs"
            onChange={(event) =>
              onChange({ customerRefNo: event.target.value })
            }
          />
        </FormField>
        <FormField label="Sales Executive">
          <SelectField
            value={values.salesExecutive}
            className="h-9 text-xs"
            onChange={(event) =>
              onChange({ salesExecutive: event.target.value })
            }
          >
            <option value="">Select Sales Executive</option>
            <option value="Ahmed Al-Farsi">Ahmed Al-Farsi</option>
          </SelectField>
        </FormField>
        <FormField label="Attention">
          <Input
            value={values.attention}
            className="h-9 text-xs"
            onChange={(event) => onChange({ attention: event.target.value })}
          />
        </FormField>
        <FormField label="Pay Terms">
          <Input
            value={values.payTerms}
            className="h-9 text-xs"
            onChange={(event) => onChange({ payTerms: event.target.value })}
          />
        </FormField>
        <FormField label="Delivery Place">
          <Input
            value={values.deliveryPlace}
            className="h-9 text-xs"
            onChange={(event) =>
              onChange({ deliveryPlace: event.target.value })
            }
          />
        </FormField>
        <FormField label="Currency">
          <SelectField
            value={values.currency}
            className="h-9 text-xs"
            onChange={(event) => onChange({ currency: event.target.value })}
          >
            <option value="SAR">SAR - Saudi Riyal</option>
            <option value="AED">AED - UAE Dirham</option>
            <option value="QAR">QAR - Qatari Riyal</option>
            <option value="KWD">KWD - Kuwaiti Dinar</option>
            <option value="BHD">BHD - Bahraini Dinar</option>
            <option value="OMR">OMR - Omani Rial</option>
          </SelectField>
        </FormField>
        <FormField label="Ex Rate">
          <Input
            type="number"
            min="0"
            step="0.00000001"
            value={values.exchangeRate}
            className="h-9 text-xs"
            onChange={(event) =>
              onChange({ exchangeRate: event.target.value })
            }
          />
        </FormField>
        <FormField label="Notes">
          <textarea
            rows={1}
            value={values.notes}
            placeholder="Notes"
            className="input-base h-9 resize-none py-2 text-xs"
            onChange={(event) => onChange({ notes: event.target.value })}
          />
        </FormField>
      </div>
    </section>
  )
}
