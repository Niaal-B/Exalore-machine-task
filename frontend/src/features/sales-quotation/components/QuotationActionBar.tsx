import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

type QuotationActionBarProps = {
  isEditing: boolean
  isSaving: boolean
  canPreview: boolean
  canPrint: boolean
  onNew: () => void
  onSave: () => void
  onPreview: () => void
  onPrint: () => void
  onCancel: () => void
}

export function QuotationActionBar({
  isEditing,
  isSaving,
  canPreview,
  canPrint,
  onNew,
  onSave,
  onPreview,
  onPrint,
  onCancel,
}: QuotationActionBarProps) {
  return (
    <div className="flex items-center justify-end gap-2 bg-white px-4 py-3 shadow-sm border-t border-slate-200 mt-auto">
      <div className="flex items-center gap-1 mr-4">
        <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-slate-500 rounded-full">
          <ChevronsLeft size={16} />
        </Button>
        <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-slate-500 rounded-full">
          <ChevronLeft size={16} />
        </Button>
        <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-slate-500 rounded-full">
          <ChevronRight size={16} />
        </Button>
        <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-slate-500 rounded-full">
          <ChevronsRight size={16} />
        </Button>
      </div>

      <Button
        type="button"
        disabled={isSaving}
        className="bg-[#10b981] hover:bg-[#059669] text-white h-8 px-6 rounded-md text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onNew}
      >
        New
      </Button>
      <Button
        type="button"
        disabled={!isEditing || isSaving}
        className="h-8 rounded-md bg-indigo-600 px-6 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onSave}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={!canPrint}
        className="h-8 rounded-md bg-slate-200 px-5 text-xs font-medium text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:text-slate-400"
        onClick={onPrint}
      >
        Print
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={!canPreview}
        className="h-8 rounded-md bg-slate-200 px-5 text-xs font-medium text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:text-slate-400"
        onClick={onPreview}
      >
        Preview
      </Button>
      <Button asChild className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white h-8 px-6 rounded-md text-xs font-medium">
        <Link to="/sales-quotations">List</Link>
      </Button>
      <Button
        type="button"
        disabled={!isEditing || isSaving}
        className="bg-[#1e293b] hover:bg-[#0f172a] text-white h-8 px-6 rounded-md text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  )
}
