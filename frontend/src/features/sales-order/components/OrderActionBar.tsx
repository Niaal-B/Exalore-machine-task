import { Button } from "@/components/ui/button"

export function OrderActionBar() {
  return (
    <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Button type="button" className="h-8 bg-emerald-600 px-5 text-xs text-white hover:bg-emerald-700">
        Save
      </Button>
      <Button type="button" className="h-8 bg-indigo-600 px-5 text-xs text-white hover:bg-indigo-700">
        Save &amp; New
      </Button>
      <Button type="button" variant="secondary" className="h-8 px-5 text-xs">
        Clear
      </Button>
      <Button type="button" className="h-8 bg-slate-800 px-5 text-xs text-white hover:bg-slate-900">
        Cancel
      </Button>
    </footer>
  )
}
