import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuotationActionBar() {
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

      <Button type="button" className="bg-[#10b981] hover:bg-[#059669] text-white h-8 px-6 rounded-md text-xs font-medium">
        New
      </Button>
      <Button type="button" variant="secondary" className="bg-slate-200 hover:bg-slate-300 text-slate-400 h-8 px-5 rounded-md text-xs font-medium cursor-not-allowed">
        Print
      </Button>
      <Button type="button" variant="secondary" className="bg-slate-200 hover:bg-slate-300 text-slate-400 h-8 px-5 rounded-md text-xs font-medium cursor-not-allowed">
        Preview
      </Button>
      <Button type="button" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white h-8 px-6 rounded-md text-xs font-medium">
        List
      </Button>
      <Button type="button" className="bg-[#1e293b] hover:bg-[#0f172a] text-white h-8 px-6 rounded-md text-xs font-medium">
        Cancel
      </Button>
    </div>
  )
}
