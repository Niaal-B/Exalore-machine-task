import { Navigate, Route, Routes } from "react-router-dom"

import { ErpLayout } from "@/app/layouts/ErpLayout"
import { ItemCreatePage } from "@/features/items/pages/ItemCreatePage"

export function AppRouter() {
  return (
    <Routes>
      <Route element={<ErpLayout />}>
        <Route index element={<Navigate to="/items/new" replace />} />
        <Route path="/items/new" element={<ItemCreatePage />} />
      </Route>
    </Routes>
  )
}
