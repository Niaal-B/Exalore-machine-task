import { QuotationTotalsSection } from "@/features/sales-quotation/components/QuotationTotalsSection"
import type { QuotationTotals } from "@/features/sales-quotation/utils/quotationTotals"

export function OrderTotalsSection({ totals }: { totals: QuotationTotals }) {
  return <QuotationTotalsSection totals={totals} />
}
