import axios from "axios"
import { ImageUp, Save, UploadCloud } from "lucide-react"
import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useMemo,
  useState,
} from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QuotationToast } from "@/features/sales-quotation/components/QuotationToast"
import {
  getPrintTemplate,
  updatePrintTemplate,
} from "@/features/print-settings/services/printTemplateService"
import type { PrintTemplateSetting } from "@/features/print-settings/types/print-template"

function imagePreview(file?: File, currentUrl?: string | null) {
  if (file) return URL.createObjectURL(file)
  return currentUrl || ""
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`
}

function getReadableTextColor(hexColor: string) {
  const normalized = /^#[0-9a-fA-F]{6}$/.test(hexColor)
    ? hexColor
    : "#312e81"
  const red = Number.parseInt(normalized.slice(1, 3), 16)
  const green = Number.parseInt(normalized.slice(3, 5), 16)
  const blue = Number.parseInt(normalized.slice(5, 7), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

  return luminance > 0.62 ? "#0f172a" : "#ffffff"
}

function detectDominantColor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      const canvas = document.createElement("canvas")
      const size = 64
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext("2d")
      if (!context) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("Canvas is not available."))
        return
      }

      context.drawImage(image, 0, 0, size, size)
      const { data } = context.getImageData(0, 0, size, size)
      const buckets = new Map<string, { count: number; red: number; green: number; blue: number }>()

      for (let index = 0; index < data.length; index += 4) {
        const alpha = data[index + 3]
        if (alpha < 180) continue

        const red = data[index]
        const green = data[index + 1]
        const blue = data[index + 2]
        const brightness = (red + green + blue) / 3

        // Ignore near-white and near-black pixels so logos/backgrounds do not dominate.
        if (brightness > 235 || brightness < 25) continue

        const bucketRed = Math.round(red / 32) * 32
        const bucketGreen = Math.round(green / 32) * 32
        const bucketBlue = Math.round(blue / 32) * 32
        const key = `${bucketRed}-${bucketGreen}-${bucketBlue}`
        const current = buckets.get(key)

        if (current) {
          current.count += 1
          current.red += red
          current.green += green
          current.blue += blue
        } else {
          buckets.set(key, { count: 1, red, green, blue })
        }
      }

      const dominant = [...buckets.values()].sort((first, second) => second.count - first.count)[0]
      URL.revokeObjectURL(objectUrl)

      if (!dominant) {
        resolve("#312e81")
        return
      }

      resolve(
        rgbToHex(
          Math.round(dominant.red / dominant.count),
          Math.round(dominant.green / dominant.count),
          Math.round(dominant.blue / dominant.count),
        ),
      )
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Unable to read the selected image."))
    }

    image.src = objectUrl
  })
}

type ImageDropZoneProps = {
  title: string
  description: string
  emptyText: string
  previewUrl: string
  selectedFile?: File
  onFileSelect: (file: File) => void
  onError: (message: string) => void
}

function ImageDropZone({
  title,
  description,
  emptyText,
  previewUrl,
  selectedFile,
  onFileSelect,
  onError,
}: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputId = useMemo(
    () => title.toLowerCase().replaceAll(" ", "-"),
    [title],
  )

  function acceptFile(file?: File) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      onError("Only image files are allowed for the print template.")
      return
    }
    onFileSelect(file)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0])
    event.target.value = ""
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    acceptFile(event.dataTransfer.files?.[0])
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ImageUp className="text-indigo-600" size={18} />
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <Input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
      />
      <label
        htmlFor={inputId}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${
          isDragging
            ? "border-indigo-400 bg-indigo-50 text-indigo-700"
            : "border-slate-300 bg-slate-50 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50/50"
        }`}
      >
        <UploadCloud size={28} />
        <p className="mt-2 text-sm font-semibold">
          Drop image here or click to browse
        </p>
        <p className="mt-1 text-xs">
          {selectedFile ? selectedFile.name : "PNG, JPG, JPEG, WebP supported"}
        </p>
      </label>

      <div className="mt-4 overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${title} preview`}
            className="h-36 w-full object-contain"
          />
        ) : (
          <div className="grid h-36 place-items-center text-sm text-slate-400">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  )
}

export function PrintTemplateSettingsPage() {
  const [setting, setSetting] = useState<PrintTemplateSetting | null>(null)
  const [headerImage, setHeaderImage] = useState<File | undefined>()
  const [footerImage, setFooterImage] = useState<File | undefined>()
  const [primaryColor, setPrimaryColor] = useState("#312e81")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let current = true

    async function loadTemplate() {
      setIsLoading(true)
      setError("")
      try {
        const data = await getPrintTemplate()
        if (current) {
          setSetting(data)
          setPrimaryColor(data.primaryColor || "#312e81")
        }
      } catch {
        if (current) setError("Unable to load print template settings.")
      } finally {
        if (current) setIsLoading(false)
      }
    }

    void loadTemplate()

    return () => {
      current = false
    }
  }, [])

  async function saveTemplate() {
    if (!headerImage && !footerImage && primaryColor === setting?.primaryColor) {
      setError("Choose an image or change the primary color before saving.")
      return
    }

    setIsSaving(true)
    setError("")
    setSuccess("")
    try {
      const updated = await updatePrintTemplate({
        headerImage,
        footerImage,
        primaryColor,
      })
      setSetting(updated)
      setPrimaryColor(updated.primaryColor)
      setHeaderImage(undefined)
      setFooterImage(undefined)
      setSuccess("Print template images updated successfully.")
    } catch (saveError: unknown) {
      if (axios.isAxiosError(saveError) && saveError.response?.status === 400) {
        setError("Please upload valid image files for the header and footer.")
      } else {
        setError("Unable to update print template settings.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const headerPreview = imagePreview(headerImage, setting?.headerImageUrl)
  const footerPreview = imagePreview(footerImage, setting?.footerImageUrl)
  const primaryTextColor = getReadableTextColor(primaryColor)

  async function selectHeaderImage(file: File) {
    setHeaderImage(file)
    try {
      const detectedColor = await detectDominantColor(file)
      setPrimaryColor(detectedColor)
    } catch {
      setPrimaryColor("#312e81")
    }
  }

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#f4f6fa]">
      {error && (
        <QuotationToast
          type="error"
          title="Print template"
          message={error}
          onClose={() => setError("")}
        />
      )}
      {success && (
        <QuotationToast
          type="success"
          title="Print template"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Print Template Settings
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Upload the header and footer images used in quotation and sales
                order PDF documents.
              </p>
            </div>
            <Button
              type="button"
              disabled={isSaving || isLoading}
              className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              onClick={saveTemplate}
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={15} /> Save Template
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ImageDropZone
            title="Header Image"
            description="Recommended: wide banner image for the top of the PDF."
            emptyText="No header image uploaded"
            previewUrl={headerPreview}
            selectedFile={headerImage}
            onFileSelect={(file) => void selectHeaderImage(file)}
            onError={setError}
          />

          <ImageDropZone
            title="Footer Image"
            description="Recommended: wide banner image for the bottom of the PDF."
            emptyText="No footer image uploaded"
            previewUrl={footerPreview}
            selectedFile={footerImage}
            onFileSelect={setFooterImage}
            onError={setError}
          />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                PDF Primary Color
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Auto-detected from the header image. You can manually adjust it
                before saving.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={primaryColor}
                className="h-10 w-16 cursor-pointer p-1"
                onChange={(event) => setPrimaryColor(event.target.value)}
              />
              <Input
                value={primaryColor}
                className="h-10 w-32 font-mono text-sm"
                onChange={(event) => setPrimaryColor(event.target.value)}
              />
              <div
                className="grid h-10 w-32 place-items-center rounded-md border border-slate-200 text-xs font-bold"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryTextColor,
                }}
                aria-label="Selected primary color preview"
              >
                Total Preview
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
