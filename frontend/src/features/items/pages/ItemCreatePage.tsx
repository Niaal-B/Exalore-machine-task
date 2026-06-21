import {
  BadgeDollarSign,
  Barcode,
  Boxes,
  Eraser,
  Image as ImageIcon,
  List,
  Package,
  Save,
} from "lucide-react"
import {
  type ChangeEvent,
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
import { GeneralTab } from "@/features/items/components/GeneralTab"
import { PhotoTab } from "@/features/items/components/PhotoTab"
import { PriceListTab } from "@/features/items/components/PriceListTab"
import { UnitBarcodeTab } from "@/features/items/components/UnitBarcodeTab"
import type {
  PriceRow,
  UnitRow,
} from "@/features/items/types/item-form"

const initialUnits: UnitRow[] = [
  { id: 1, unit: "Pcs", coFactor: "1", barcode: "1234567890123" },
  { id: 2, unit: "Box", coFactor: "12", barcode: "9876543210987" },
]

const initialPrices: PriceRow[] = [
  {
    id: 1,
    priceListType: "Retail",
    unit: "Pcs",
    salePrice: "10.00",
    minimumPrice: "8.00",
  },
  {
    id: 2,
    priceListType: "Wholesale",
    unit: "Box",
    salePrice: "95.00",
    minimumPrice: "85.00",
  },
]

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
  const [units, setUnits] = useState(initialUnits)
  const [prices, setPrices] = useState(initialPrices)
  const [photoName, setPhotoName] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")

  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    },
    [photoUrl],
  )

  function addUnit() {
    setUnits((rows) => [
      ...rows,
      { id: Date.now(), unit: "", coFactor: "1", barcode: "" },
    ])
  }

  function addPrice() {
    setPrices((rows) => [
      ...rows,
      {
        id: Date.now(),
        priceListType: "Retail",
        unit: units[0]?.unit || "",
        salePrice: "",
        minimumPrice: "",
      },
    ])
  }

  function updateUnit(
    id: number,
    field: keyof Omit<UnitRow, "id">,
    value: string,
  ) {
    setUnits((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
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
    setPhotoName(file.name)
    setPhotoUrl(URL.createObjectURL(file))
  }

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="mx-auto max-w-[1540px]"
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

      <Tabs defaultValue="general">
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
          <GeneralTab />
        </TabsContent>
        <TabsContent value="units">
          <UnitBarcodeTab
            units={units}
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
            onAdd={addPrice}
            onRemove={(id) =>
              setPrices((rows) => rows.filter((row) => row.id !== id))
            }
            onUpdate={updatePrice}
          />
        </TabsContent>
        <TabsContent value="photo">
          <PhotoTab
            photoName={photoName}
            photoUrl={photoUrl}
            onPhotoChange={handlePhoto}
          />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-[0_16px_45px_rgba(15,23,42,0.13)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden items-center gap-2 px-2 text-xs text-slate-400 sm:flex">
          <Boxes size={15} />
          Complete all required fields before saving.
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline">
            <Eraser size={15} /> Clear
          </Button>
          <Button type="button" variant="secondary">
            <List size={15} /> View items
          </Button>
          <Button type="submit">
            <Save size={15} /> Save item
          </Button>
        </div>
      </div>
    </form>
  )
}
