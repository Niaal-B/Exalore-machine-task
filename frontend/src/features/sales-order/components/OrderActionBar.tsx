import { Button } from "@/components/ui/button"

type OrderActionBarProps = {
  isEditing: boolean
  isSaving: boolean
  canPreview: boolean
  canPrint: boolean
  onNew: () => void
  onSave: () => void
  onPreview: () => void
  onPrint: () => void
  onClear: () => void
  onCancel: () => void
}

export function OrderActionBar({
  isEditing,
  isSaving,
  canPreview,
  canPrint,
  onNew,
  onSave,
  onPreview,
  onPrint,
  onClear,
  onCancel,
}: OrderActionBarProps) {
  return (
    <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Button
        type="button"
        disabled={isSaving}
        className="h-8 bg-indigo-600 px-5 text-xs text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onNew}
      >
        New
      </Button>
      <Button
        type="button"
        disabled={!isEditing || isSaving}
        className="h-8 bg-emerald-600 px-5 text-xs text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onSave}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={!canPreview}
        className="h-8 px-5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onPreview}
      >
        Preview
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={!canPrint}
        className="h-8 px-5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onPrint}
      >
        Print
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={!isEditing || isSaving}
        className="h-8 px-5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onClear}
      >
        Clear
      </Button>
      <Button
        type="button"
        disabled={!isEditing || isSaving}
        className="h-8 bg-slate-800 px-5 text-xs text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </footer>
  )
}
