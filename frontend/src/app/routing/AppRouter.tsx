import { Navigate, Route, Routes } from "react-router-dom"

import { ErpLayout } from "@/app/layouts/ErpLayout"
import { ItemCreatePage } from "@/features/items/pages/ItemCreatePage"
import { SalesQuotationCreatePage } from "@/features/sales-quotation/pages/SalesQuotationCreatePage"

export function AppRouter() {
  return (
    <Routes>
      <Route element={<ErpLayout />}>
        <Route index element={<Navigate to="/sales-quotations/new" replace />} />
        <Route path="/items/new" element={<ItemCreatePage />} />
        <Route path="/sales-quotations/new" element={<SalesQuotationCreatePage />} />
      </Route>
    </Routes>
  )
}
