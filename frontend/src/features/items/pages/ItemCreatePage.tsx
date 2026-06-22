import {
  AlertCircle,
  BadgeDollarSign,
  Barcode,
  Boxes,
  CheckCircle2,
  Eraser,
  Image as ImageIcon,
  List,
  LoaderCircle,
  Package,
  Save,
} from "lucide-react"
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react"

import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  createItem,
  parseItemApiError,
} from "@/features/items/api/itemApi"
import { GeneralTab } from "@/features/items/components/GeneralTab"
import { PhotoTab } from "@/features/items/components/PhotoTab"
import { PriceListTab } from "@/features/items/components/PriceListTab"
import { UnitBarcodeTab } from "@/features/items/components/UnitBarcodeTab"
import type {
  ItemGeneralValues,
  PriceRow,
  UnitRow,
} from "@/features/items/types/item-form"
import type { CreateItemRequest } from "@/features/items/types/item"

const initialGeneralValues: ItemGeneralValues = {
  code: "",
  name: "",
  secondary_name: "",
  generic_name: "",
  description: "",
  behaviour: "purchase",
  group_code: "",
  status: "active",
  tax_status: "taxable",
  shelf_code: "",
  manufacturer: "",
}

const initialUnits: UnitRow[] = [
  {
    id: 1,
    unit: "Pcs",
    co_factor: "1",
    barcode: "",
  },
]

const initialPrices: PriceRow[] = [
  {
    id: 1,
    price_list_type: "Retail",
    unit: "Pcs",
    sale_price: "",
    minimum_selling_price: "",
  },
]

function freshUnits() {
  return initialUnits.map((unit) => ({ ...unit }))
}

function freshPrices() {
  return initialPrices.map((price) => ({ ...price }))
}

function TabLabel({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-200/70 text-slate-500 group-data-[state=active]:bg-indigo-600 group-data-[state=active]:text-white">
        {icon}
      </span>
      <span>
        <span className="block text-xs font-bold">{title}</span>
        <span className="mt-0.5 block text-[10px] text-slate-400">
          {description}
        </span>
      </span>
    </>
  )
}

export function ItemCreatePage() {
  const [general, setGeneral] = useState<ItemGeneralValues>(
    initialGeneralValues,
  )
  const [units, setUnits] = useState<UnitRow[]>(freshUnits)
  const [prices, setPrices] = useState<PriceRow[]>(freshPrices)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState("")
  const [photoInputKey, setPhotoInputKey] = useState(0)
  const [activeTab, setActiveTab] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    },
    [photoUrl],
  )

  function addUnit() {
    setUnits((rows) => [
      ...rows,
      {
        id: Date.now(),
        unit: "",
        co_factor: "1",
        barcode: "",
      },
    ])
  }

  function addPrice() {
    setPrices((rows) => [
      ...rows,
      {
        id: Date.now(),
        price_list_type: "Retail",
        unit: units[0]?.unit || "",
        sale_price: "",
        minimum_selling_price: "",
      },
    ])
  }

  function updateUnit(
    id: number,
    field: keyof Omit<UnitRow, "id">,
    value: string,
  ) {
    const currentUnit = units.find((unit) => unit.id === id)

    setUnits((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )

    if (field === "unit" && currentUnit) {
      setPrices((rows) =>
        rows.map((price) =>
          price.unit === currentUnit.unit
            ? { ...price, unit: value }
            : price,
        ),
      )
    }
  }

  function updatePrice(
    id: number,
    field: keyof Omit<PriceRow, "id">,
    value: string,
  ) {
    setPrices((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoUrl(URL.createObjectURL(file))
  }

  function buildRequest(): CreateItemRequest {
    return {
      ...general,
      image: photoFile,
      units: units.map((unit) => ({
        unit: unit.unit.trim(),
        co_factor: unit.co_factor,
        barcode: unit.barcode.trim() || null,
        prices: prices
          .filter((price) => price.unit === unit.unit)
          .map((price) => ({
            price_list_type: price.price_list_type,
            sale_price: price.sale_price,
            minimum_selling_price: price.minimum_selling_price,
          })),
      })),
    }
  }

  function focusErrorTab(errors: Record<string, string>) {
    const paths = Object.keys(errors)

    if (paths.some((path) => path.includes(".prices."))) {
      setActiveTab("pricing")
    } else if (paths.some((path) => path.startsWith("units"))) {
      setActiveTab("units")
    } else if (paths.some((path) => path === "image")) {
      setActiveTab("photo")
    } else {
      setActiveTab("general")
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setFieldErrors({})
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const item = await createItem(buildRequest())
      resetFormValues()
      setSuccessMessage(
        "Item " + item.code + " was created successfully with ID " + item.id + ".",
      )
    } catch (error) {
      const apiError = parseItemApiError(error)
      setFieldErrors(apiError.fieldErrors)
      setErrorMessage(apiError.message)
      focusErrorTab(apiError.fieldErrors)
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetFormValues() {
    setGeneral(initialGeneralValues)
    setUnits(freshUnits())
    setPrices(freshPrices())
    setPhotoFile(null)
    setPhotoUrl("")
    setPhotoInputKey((key) => key + 1)
    setFieldErrors({})
    setErrorMessage("")
    setActiveTab("general")
  }

  function clearForm() {
    resetFormValues()
    setSuccessMessage("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[1540px]"
      noValidate
    >
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Package size={23} strokeWidth={2.1} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Item File
              </h1>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                Draft
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Create and configure inventory items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Item ID</span>
          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono font-semibold text-slate-600">
            AUTO
          </span>
        </div>
      </div>

      <div aria-live="polite" className="mb-4 space-y-3">
        {successMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <fieldset disabled={isSubmitting}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-100/70 p-2">
            <TabsTrigger value="general">
              <TabLabel
                icon={<Package size={17} />}
                title="General"
                description="Basic item information"
              />
            </TabsTrigger>
            <TabsTrigger value="units">
              <TabLabel
                icon={<Barcode size={17} />}
                title="Unit & Barcode"
                description="Units and conversions"
              />
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <TabLabel
                icon={<BadgeDollarSign size={17} />}
                title="Price List"
                description="Unit-specific pricing"
              />
            </TabsTrigger>
            <TabsTrigger value="photo">
              <TabLabel
                icon={<ImageIcon size={17} />}
                title="Photo"
                description="Item image"
              />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralTab
              values={general}
              errors={fieldErrors}
              onChange={(changes) =>
                setGeneral((values) => ({ ...values, ...changes }))
              }
            />
          </TabsContent>
          <TabsContent value="units">
            <UnitBarcodeTab
              units={units}
              errors={fieldErrors}
              onAdd={addUnit}
              onRemove={(id) =>
                setUnits((rows) => rows.filter((row) => row.id !== id))
              }
              onUpdate={updateUnit}
            />
          </TabsContent>
          <TabsContent value="pricing">
            <PriceListTab
              prices={prices}
              units={units}
              errors={fieldErrors}
              onAdd={addPrice}
              onRemove={(id) =>
                setPrices((rows) => rows.filter((row) => row.id !== id))
              }
              onUpdate={updatePrice}
            />
          </TabsContent>
          <TabsContent value="photo">
            <PhotoTab
              inputKey={photoInputKey}
              photoName={photoFile?.name || ""}
              photoUrl={photoUrl}
              error={fieldErrors.image}
              onPhotoChange={handlePhoto}
            />
          </TabsContent>
        </Tabs>
      </fieldset>

      <div className="sticky bottom-4 mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-[0_16px_45px_rgba(15,23,42,0.13)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden items-center gap-2 px-2 text-xs text-slate-400 sm:flex">
          <Boxes size={15} />
          Complete all required fields before saving.
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={clearForm}
          >
            <Eraser size={15} /> Clear
          </Button>
          <Button type="button" variant="secondary" disabled={isSubmitting}>
            <List size={15} /> View items
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" size={15} />
            ) : (
              <Save size={15} />
            )}
            {isSubmitting ? "Saving..." : "Save item"}
          </Button>
        </div>
      </div>
    </form>
  )
}
