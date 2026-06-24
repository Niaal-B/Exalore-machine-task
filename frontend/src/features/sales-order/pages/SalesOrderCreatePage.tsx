import { OrderActionBar } from "@/features/sales-order/components/OrderActionBar"
import { OrderItemsSection } from "@/features/sales-order/components/OrderItemsSection"
import { OrderTotalsSection } from "@/features/sales-order/components/OrderTotalsSection"
import { SalesOrderHeaderSection } from "@/features/sales-order/components/SalesOrderHeaderSection"
import {
  DUMMY_SALES_ORDER,
  DUMMY_SALES_ORDER_LINES,
} from "@/features/sales-order/types/sales-order"

export function SalesOrderCreatePage() {
  return (
    <div className="flex h-[calc(100vh-68px)] min-w-0 flex-col overflow-hidden bg-[#f4f6fa]">
      <div className="min-w-0 flex-1 overflow-y-auto p-3">
        <div className="mb-3 rounded-lg border-b-2 border-indigo-50 bg-white py-3 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Sales Order</h1>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Create a manual order or reference an existing quotation
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <SalesOrderHeaderSection order={DUMMY_SALES_ORDER} />
          <OrderItemsSection lines={DUMMY_SALES_ORDER_LINES} />
          <OrderTotalsSection />
        </div>
      </div>
      <OrderActionBar />
    </div>
  )
}
