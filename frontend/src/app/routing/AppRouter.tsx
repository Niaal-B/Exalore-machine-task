import { Navigate, Route, Routes } from "react-router-dom"

import { ErpLayout } from "@/app/layouts/ErpLayout"
import { ItemCreatePage } from "@/features/items/pages/ItemCreatePage"
import { ItemListPage } from "@/features/items/pages/ItemListPage"
import { SalesOrderCreatePage } from "@/features/sales-order/pages/SalesOrderCreatePage"
import { SalesOrderListPage } from "@/features/sales-order/pages/SalesOrderListPage"
import { SalesQuotationCreatePage } from "@/features/sales-quotation/pages/SalesQuotationCreatePage"
import { SalesQuotationListPage } from "@/features/sales-quotation/pages/SalesQuotationListPage"

export function AppRouter() {
  return (
    <Routes>
      <Route element={<ErpLayout />}>
        <Route index element={<Navigate to="/sales-quotations/new" replace />} />
        <Route path="/items/new" element={<ItemCreatePage />} />
        <Route path="/items" element={<ItemListPage />} />
        <Route path="/sales-quotations/new" element={<SalesQuotationCreatePage />} />
        <Route path="/sales-quotations" element={<SalesQuotationListPage />} />
        <Route path="/sales-orders/new" element={<SalesOrderCreatePage />} />
        <Route path="/sales-orders" element={<SalesOrderListPage />} />
      </Route>
    </Routes>
  )
}
