import { Input } from "@/components/ui/input"
import { FormField, SelectField } from "@/features/items/components/FormField"
import { FormSection } from "@/features/items/components/FormSection"

export function GeneralTab() {
  return (
    <div className="space-y-5">
      <FormSection
        title="Basic Information"
        description="Core item identity used across the ERP"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <FormField label="Item Code" required>
            <Input placeholder="Enter item code" />
          </FormField>
          <FormField label="Name 1" required>
            <Input placeholder="Enter primary item name" />
          </FormField>
          <FormField label="Name 2">
            <Input placeholder="Enter secondary item name" />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Additional Information"
        description="Descriptive details for search and documents"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <FormField label="Generic Name">
            <Input placeholder="Enter generic name" />
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <textarea
              className="input-base min-h-24 resize-y py-3"
              placeholder="Enter item description"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Configuration"
        description="Business classification, taxation, and storage"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="Behaviour" required>
            <SelectField defaultValue="purchase">
              <option value="stock">Stock Item</option>
              <option value="purchase">Purchase Item</option>
              <option value="non_stock">Non Stock Item</option>
              <option value="service">Service</option>
              <option value="assembly">Assembly</option>
            </SelectField>
          </FormField>
          <FormField label="Group Code">
            <SelectField defaultValue="">
              <option value="" disabled>
                Select group code
              </option>
              <option>COMPUTERS</option>
              <option>STATIONERY</option>
              <option>CLEANING</option>
            </SelectField>
          </FormField>
          <FormField label="Status" required>
            <SelectField defaultValue="active">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectField>
          </FormField>
          <FormField label="Taxable Status" required>
            <SelectField defaultValue="taxable">
              <option value="taxable">Taxable</option>
              <option value="non_taxable">Non-taxable</option>
            </SelectField>
          </FormField>
          <FormField label="Shelf Code">
            <Input placeholder="Select shelf code" />
          </FormField>
          <FormField label="Manufacturer">
            <Input placeholder="Enter manufacturer" />
          </FormField>
        </div>
      </FormSection>
    </div>
  )
}
