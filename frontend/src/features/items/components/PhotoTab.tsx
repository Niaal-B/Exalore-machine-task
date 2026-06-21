import {
  ImagePlus,
  UploadCloud,
} from "lucide-react"
import type { ChangeEvent } from "react"

import { FormSection } from "@/features/items/components/FormSection"

type PhotoTabProps = {
  photoName: string
  photoUrl: string
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function PhotoTab({
  photoName,
  photoUrl,
  onPhotoChange,
}: PhotoTabProps) {
  return (
    <FormSection
      title="Item Photo"
      description="Upload a clear image for catalogues and item identification"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <label className="group flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/30">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={onPhotoChange}
          />
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-indigo-500 shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-105">
            <UploadCloud size={27} />
          </span>
          <p className="mt-5 text-sm font-bold text-slate-700">
            Drop an image here or click to browse
          </p>
          <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
            PNG, JPG or WebP. Use a square image for the best catalogue
            presentation.
          </p>
          <span className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">
            Choose image
          </span>
        </label>

        <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
          {photoUrl ? (
            <div className="w-full">
              <img
                src={photoUrl}
                alt="Selected item preview"
                className="mx-auto max-h-56 rounded-xl object-contain"
              />
              <p className="mt-4 truncate text-center text-xs font-medium text-slate-500">
                {photoName}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <ImagePlus
                className="mx-auto text-slate-300"
                size={42}
                strokeWidth={1.5}
              />
              <p className="mt-3 text-xs font-medium text-slate-400">
                Image preview
              </p>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  )
}
