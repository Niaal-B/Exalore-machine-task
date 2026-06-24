import { CheckCircle2, CircleX, X } from "lucide-react"
import { useEffect } from "react"

type QuotationToastProps = {
  message: string
  type: "success" | "error"
  onClose: () => void
}

export function QuotationToast({
  message,
  type,
  onClose,
}: QuotationToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 5_000)
    return () => window.clearTimeout(timeout)
  }, [message, onClose])

  const isSuccess = type === "success"
  const Icon = isSuccess ? CheckCircle2 : CircleX

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`fixed right-5 top-5 z-[200] flex w-full max-w-md items-start gap-3 rounded-lg border bg-white p-4 shadow-xl ${
        isSuccess ? "border-emerald-200" : "border-rose-200"
      }`}
    >
      <Icon
        className={isSuccess ? "text-emerald-600" : "text-rose-600"}
        size={20}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {isSuccess ? "Quotation created" : "Unable to save quotation"}
        </p>
        <p className="mt-1 text-sm leading-5 text-slate-600">{message}</p>
      </div>
      <button
        type="button"
        aria-label="Close notification"
        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        onClick={onClose}
      >
        <X size={16} />
      </button>
    </div>
  )
}
