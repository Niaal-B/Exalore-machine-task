import { Building2, Download, Printer } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PrintableSalesDocument } from "@/features/sales-documents/types/printable-sales-document"
import { printSalesDocument } from "@/features/sales-documents/utils/printSalesDocument"
import { getPrintTemplate } from "@/features/print-settings/services/printTemplateService"
import type { PrintTemplateSetting } from "@/features/print-settings/types/print-template"

type SalesDocumentPrintDialogProps = {
  document: PrintableSalesDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function money(value: string, currency: string) {
  const parsed = Number(value)
  return `${Number.isFinite(parsed) ? parsed.toFixed(4) : value} ${currency}`
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

export function SalesDocumentPrintDialog({
  document,
  open,
  onOpenChange,
}: SalesDocumentPrintDialogProps) {
  const [template, setTemplate] = useState<PrintTemplateSetting | null>(null)

  useEffect(() => {
    if (!open) return
    let current = true

    async function loadTemplate() {
      try {
        const latestTemplate = await getPrintTemplate()
        if (current) setTemplate(latestTemplate)
      } catch {
        if (current) setTemplate(null)
      }
    }

    void loadTemplate()

    return () => {
      current = false
    }
  }, [open])

  if (!document) return null

  const documentWithTemplate: PrintableSalesDocument = {
    ...document,
    template: {
      headerImageUrl: template?.headerImageUrl ?? null,
      footerImageUrl: template?.footerImageUrl ?? null,
      primaryColor: template?.primaryColor ?? "#312e81",
    },
  }
  const primaryColor = documentWithTemplate.template?.primaryColor ?? "#312e81"
  const primaryTextColor = getReadableTextColor(primaryColor)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-5xl overflow-y-auto" data-print-shell>
        <DialogHeader className="flex flex-row items-center justify-between pr-12" data-print-hide>
          <div>
            <DialogTitle>{document.title} Preview</DialogTitle>
            <DialogDescription>
              Review the document, then print or save it as a PDF.
            </DialogDescription>
          </div>
          <Button type="button" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => printSalesDocument(documentWithTemplate)}>
            <Printer size={15} /> Print / Save PDF
          </Button>
        </DialogHeader>

        <article className="relative m-4 min-h-[1120px] overflow-hidden bg-white text-slate-800 shadow-sm print:m-0 print:shadow-none" data-print-root>
          {document.isDraftPreview && (
            <div className="pointer-events-none absolute inset-0 z-0 grid place-items-center overflow-hidden">
              <span className="-rotate-35 text-[110px] font-black tracking-[0.2em] text-slate-100">
                DRAFT
              </span>
            </div>
          )}

          <div className="relative z-10">
            {documentWithTemplate.template?.headerImageUrl ? (
              <>
                <header className="border-b border-slate-200 bg-white">
                  <img
                    src={documentWithTemplate.template.headerImageUrl}
                    alt="Document header"
                    className="h-32 w-full object-cover"
                  />
                </header>
                <div className="flex items-center justify-between border-b border-slate-200 px-10 py-4">
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.22em]"
                      style={{ color: primaryColor }}
                    >
                      {document.title}
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {document.documentNumber}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {document.status}
                  </span>
                </div>
              </>
            ) : (
              <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-10 py-9 text-white">
                <div className="flex items-start justify-between gap-8">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
                      <Building2 size={27} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-wide">EXALORE</h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-300">Enterprise Resource Planning</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.22em] text-indigo-200">{document.title}</p>
                    <p className="mt-2 text-xl font-semibold">{document.documentNumber}</p>
                    <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-white/20">
                      {document.status}
                    </span>
                  </div>
                </div>
              </header>
            )}

            <div className="px-10 py-8">
              <section className="grid grid-cols-2 gap-8 border-b border-slate-200 pb-7">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: primaryColor }}
                  >
                    Bill To
                  </p>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{document.customerName || "Customer not selected"}</h3>
                  <p className="mt-1 text-sm text-slate-500">{document.customerCode || "—"}</p>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><dt className="text-xs text-slate-400">Document Date</dt><dd className="mt-1 font-semibold">{document.documentDate}</dd></div>
                  <div><dt className="text-xs text-slate-400">Currency</dt><dd className="mt-1 font-semibold">{document.currency}</dd></div>
                  <div><dt className="text-xs text-slate-400">Exchange Rate</dt><dd className="mt-1 font-semibold">{document.exchangeRate}</dd></div>
                  {document.references.slice(0, 1).map((reference) => (
                    <div key={reference.label}><dt className="text-xs text-slate-400">{reference.label}</dt><dd className="mt-1 font-semibold">{reference.value || "—"}</dd></div>
                  ))}
                </dl>
              </section>

              <section className="mt-7 overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full table-fixed border-collapse text-[11px]">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="w-[5%] px-2 py-3 text-center">#</th><th className="w-[12%] px-2 py-3 text-left">Item</th>
                      <th className="w-[25%] px-2 py-3 text-left">Description</th><th className="w-[7%] px-2 py-3 text-left">Unit</th>
                      <th className="w-[8%] px-2 py-3 text-right">Qty</th><th className="w-[10%] px-2 py-3 text-right">Rate</th>
                      <th className="w-[8%] px-2 py-3 text-right">Disc %</th><th className="w-[11%] px-2 py-3 text-right">VAT</th>
                      <th className="w-[14%] px-2 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.lines.map((line) => (
                      <tr key={line.lineNo} className="border-b border-slate-100 even:bg-slate-50/70">
                        <td className="px-2 py-3 text-center">{line.lineNo}</td><td className="px-2 py-3 font-semibold">{line.itemCode}</td>
                        <td className="px-2 py-3 text-slate-600">{line.description}</td><td className="px-2 py-3">{line.unit}</td>
                        <td className="px-2 py-3 text-right">{line.quantity}</td><td className="px-2 py-3 text-right">{line.rate}</td>
                        <td className="px-2 py-3 text-right">{line.discountPercentage}</td><td className="px-2 py-3 text-right">{line.vatAmount}</td>
                        <td className="px-2 py-3 text-right font-semibold">{line.netAfterVat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="mt-7 grid grid-cols-[1fr_320px] gap-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Notes</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{document.notes || "No additional notes."}</p>
                </div>
                <dl className="space-y-3 rounded-xl bg-slate-50 p-5 text-sm ring-1 ring-slate-200">
                  <div className="flex justify-between"><dt className="text-slate-500">Gross Amount</dt><dd className="font-medium">{money(document.totals.grossAmount, document.currency)}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Discount</dt><dd className="font-medium">{money(document.totals.discountAmount, document.currency)}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Net Amount</dt><dd className="font-medium">{money(document.totals.netAmount, document.currency)}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">VAT Amount</dt><dd className="font-medium">{money(document.totals.vatAmount, document.currency)}</dd></div>
                  <div
                    className="flex justify-between rounded-b-lg px-4 py-3 text-base text-white"
                    style={{
                      backgroundColor: primaryColor,
                      color: primaryTextColor,
                    }}
                  >
                    <dt className="font-bold">Total</dt>
                    <dd className="font-bold">{money(document.totals.netAfterVat, document.currency)}</dd>
                  </div>
                </dl>
              </section>

              <section className="mt-20 grid grid-cols-2 gap-24 text-center text-xs text-slate-500">
                <div className="border-t border-slate-300 pt-3">Authorized Signature</div>
                <div className="border-t border-slate-300 pt-3">Customer Acceptance</div>
              </section>
            </div>

            {documentWithTemplate.template?.footerImageUrl ? (
              <footer className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
                <img
                  src={documentWithTemplate.template.footerImageUrl}
                  alt="Document footer"
                  className="h-20 w-full object-contain"
                />
              </footer>
            ) : (
              <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-slate-200 px-10 py-4 text-[10px] text-slate-400">
                <span>Generated by Exalore ERP</span>
                <span className="flex items-center gap-1"><Download size={11} /> Official business document</span>
              </footer>
            )}
          </div>
        </article>
      </DialogContent>
    </Dialog>
  )
}
