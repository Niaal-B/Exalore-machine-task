import { QuotationActionBar } from "@/features/sales-quotation/components/QuotationActionBar"
import { QuotationHeaderSection } from "@/features/sales-quotation/components/QuotationHeaderSection"
import { QuotationItemsSection } from "@/features/sales-quotation/components/QuotationItemsSection"
import { QuotationTotalsSection } from "@/features/sales-quotation/components/QuotationTotalsSection"

export function SalesQuotationCreatePage() {
  return (
    <div className="flex h-[calc(100vh-68px)] flex-col bg-[#f4f6fa] overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Page header */}
        <div className="mb-3 rounded-t-xl bg-white py-3 shadow-sm text-center border-b-2 border-indigo-50">
          <h1 className="text-xl font-bold text-[#1e293b]">
            Sales Quotation
          </h1>
        </div>

        <div className="flex flex-col gap-3 bg-white p-3 rounded-b-xl shadow-sm">
          {/* Sections */}
          <QuotationHeaderSection />
          
          {/* Notice Bar */}
          <div className="rounded-md bg-[#fff4cc] px-4 py-2 text-sm font-medium text-[#856404] border border-[#ffeeba]">
            Click 'New/Edit' to enable the form
          </div>

          <QuotationItemsSection />
          
          <div className="mt-auto">
            <QuotationTotalsSection />
          </div>
        </div>
      </div>

      {/* Sticky footer action bar */}
      <QuotationActionBar />
    </div>
  )
}
