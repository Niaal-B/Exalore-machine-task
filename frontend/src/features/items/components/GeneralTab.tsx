import { Input } from "@/components/ui/input"
import { FormField, SelectField } from "@/features/items/components/FormField"
import { FormSection } from "@/features/items/components/FormSection"
import type { ItemGeneralValues } from "@/features/items/types/item-form"
import type {
  ItemBehaviour,
  ItemStatus,
  TaxStatus,
} from "@/features/items/types/item"

type GeneralTabProps = {
  values: ItemGeneralValues
  errors: Record<string, string>
  onChange: (changes: Partial<ItemGeneralValues>) => void
}

export function GeneralTab({
  values,
  errors,
  onChange,
}: GeneralTabProps) {
  return (
    <div className="space-y-5">
      <FormSection
        title="Basic Information"
        description="Core item identity used across the ERP"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <FormField label="Item Code" required error={errors.code}>
            <Input
              required
              value={values.code}
              placeholder="Enter item code"
              onChange={(event) => onChange({ code: event.target.value })}
            />
          </FormField>
          <FormField label="Name 1" required error={errors.name}>
            <Input
              required
              value={values.name}
              placeholder="Enter primary item name"
              onChange={(event) => onChange({ name: event.target.value })}
            />
          </FormField>
          <FormField label="Name 2" error={errors.secondary_name}>
            <Input
              value={values.secondary_name}
              placeholder="Enter secondary item name"
              onChange={(event) =>
                onChange({ secondary_name: event.target.value })
              }
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Additional Information"
        description="Descriptive details for search and documents"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <FormField label="Generic Name" error={errors.generic_name}>
            <Input
              value={values.generic_name}
              placeholder="Enter generic name"
              onChange={(event) =>
                onChange({ generic_name: event.target.value })
              }
            />
          </FormField>
          <FormField
            label="Description"
            error={errors.description}
            className="md:col-span-2"
          >
            <textarea
              className="input-base min-h-24 resize-y py-3"
              value={values.description}
              placeholder="Enter item description"
              onChange={(event) =>
                onChange({ description: event.target.value })
              }
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Configuration"
        description="Business classification, taxation, and storage"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            label="Behaviour"
            required
            error={errors.behaviour}
          >
            <SelectField
              required
              value={values.behaviour}
              onChange={(event) =>
                onChange({
                  behaviour: event.target.value as ItemBehaviour,
                })
              }
            >
              <option value="stock">Stock Item</option>
              <option value="purchase">Purchase Item</option>
              <option value="non_stock">Non Stock Item</option>
              <option value="service">Service</option>
              <option value="assembly">Assembly</option>
            </SelectField>
          </FormField>
          <FormField label="Group Code" error={errors.group_code}>
            <SelectField
              value={values.group_code}
              onChange={(event) =>
                onChange({ group_code: event.target.value })
              }
            >
              <option value="">Select group code</option>
              <option>COMPUTERS</option>
              <option>STATIONERY</option>
              <option>CLEANING</option>
            </SelectField>
          </FormField>
          <FormField label="Status" required error={errors.status}>
            <SelectField
              required
              value={values.status}
              onChange={(event) =>
                onChange({ status: event.target.value as ItemStatus })
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectField>
          </FormField>
          <FormField
            label="Taxable Status"
            required
            error={errors.tax_status}
          >
            <SelectField
              required
              value={values.tax_status}
              onChange={(event) =>
                onChange({
                  tax_status: event.target.value as TaxStatus,
                })
              }
            >
              <option value="taxable">Taxable</option>
              <option value="non_taxable">Non-taxable</option>
            </SelectField>
          </FormField>
          <FormField label="Shelf Code" error={errors.shelf_code}>
            <Input
              value={values.shelf_code}
              placeholder="Select shelf code"
              onChange={(event) =>
                onChange({ shelf_code: event.target.value })
              }
            />
          </FormField>
          <FormField label="Manufacturer" error={errors.manufacturer}>
            <Input
              value={values.manufacturer}
              placeholder="Enter manufacturer"
              onChange={(event) =>
                onChange({ manufacturer: event.target.value })
              }
            />
          </FormField>
        </div>
      </FormSection>
    </div>
  )
}
