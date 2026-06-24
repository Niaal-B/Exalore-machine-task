import { Navigate, Outlet, useLocation } from "react-router-dom"

import { getAccessToken } from "@/features/auth/services/authStorage"

export function ProtectedRoute() {
  const location = useLocation()
  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
