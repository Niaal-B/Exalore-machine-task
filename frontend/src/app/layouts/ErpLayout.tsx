import {
  ClipboardList,
  FileBox,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  ReceiptText,
  UserRound,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"

import { clearTokens } from "@/features/auth/services/authStorage"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  icon: LucideIcon
  href: string
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Inventory",
    items: [
      { label: "Item File", icon: FileBox, href: "/items/new" },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Sales Quotations", icon: ClipboardList, href: "/sales-quotations/new" },
      { label: "Sales Orders", icon: ReceiptText, href: "/sales-orders/new" },
    ],
  },
]

const routeLabels = [
  { path: "/items", section: "Inventory", page: "Item File" },
  {
    path: "/sales-quotations",
    section: "Sales",
    page: "Sales Quotations",
  },
  { path: "/sales-orders", section: "Sales", page: "Sales Orders" },
]

export function ErpLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const currentRoute = routeLabels.find((route) =>
    pathname.startsWith(route.path),
  )

  function logout() {
    clearTokens()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-52 flex-col bg-[#111a31] text-slate-300 shadow-2xl transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-17 items-center justify-between border-b border-white/8 px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow-lg shadow-indigo-950/30">
              <Package size={19} strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-wide text-white">Exalore</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">ERP Suite</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-5 flex-1 space-y-5 overflow-y-auto px-3 pb-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.label}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors",
                          isActive && item.href !== "#"
                            ? "bg-indigo-500/16 text-indigo-200 ring-1 ring-inset ring-indigo-400/10"
                            : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100",
                        )
                      }
                    >
                      <Icon size={16} />
                      <span className="flex-1">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/8 p-3">
          <div className="mb-2 rounded-xl border border-white/8 bg-white/[0.035] p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <UserRound size={17} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-200">admin_Client11DB</p>
                <p className="mt-0.5 text-[10px] text-slate-500">SHOWROOM (SA)</p>
              </div>
            </div>
          </div>
          <button type="button" className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-xs font-medium text-rose-300 hover:bg-rose-500/10" onClick={logout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <div className="min-w-0 lg:pl-52">
        <header className="sticky top-0 z-30 flex h-17 items-center gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
          <PanelLeftClose className="hidden text-slate-400 lg:block" size={18} />
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="text-slate-400">
              {currentRoute?.section ?? "Workspace"}
            </span>
            <span className="text-slate-300">/</span>
            <span className="truncate font-semibold text-slate-700">
              {currentRoute?.page ?? "Dashboard"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 sm:block">
              System online
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">AD</div>
          </div>
        </header>

        <main className="min-w-0 p-3 sm:p-4 lg:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
