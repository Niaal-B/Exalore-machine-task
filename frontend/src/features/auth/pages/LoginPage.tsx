import {
  ChartNoAxesCombined,
  Eye,
  EyeOff,
  FileCheck2,
  LoaderCircle,
  LockKeyhole,
  Package,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"
import { useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAccessToken } from "@/features/auth/services/authStorage"
import { login, loginErrorMessage } from "@/features/auth/services/authService"

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  if (getAccessToken()) return <Navigate to="/" replace />

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError("")
    try {
      await login(credentials)
      const destination = (location.state as { from?: string } | null)?.from || "/"
      navigate(destination, { replace: true })
    } catch (loginError: unknown) {
      setError(loginErrorMessage(loginError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_15%,#4338ca_0,transparent_33%),radial-gradient(circle_at_85%_75%,#0891b2_0,transparent_28%),linear-gradient(145deg,#020617,#111827_55%,#172554)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-10 top-38 h-52 w-52 rounded-full border border-white/10" />
        <div className="absolute bottom-24 left-14 h-28 w-28 rotate-12 rounded-3xl bg-cyan-400/10 blur-sm" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 shadow-xl ring-1 ring-white/20 backdrop-blur-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xl font-bold tracking-wide">Exalore</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-indigo-200">ERP Suite</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-indigo-100 backdrop-blur-lg">
            <Sparkles size={13} /> One workspace. Complete visibility.
          </div>
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
            Run your business with clarity and control.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
            Manage items, quotations, orders, pricing, and business documents from one secure ERP workspace.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { icon: ChartNoAxesCombined, label: "Live visibility" },
              { icon: FileCheck2, label: "Accurate documents" },
              { icon: ShieldCheck, label: "Admin secured" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                <Icon size={19} className="text-cyan-300" />
                <p className="mt-3 text-xs font-semibold text-slate-200">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">© 2026 Exalore ERP · Secure administrative workspace</p>
      </section>

      <section className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-5 py-10 sm:px-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-bl-full bg-indigo-100/60" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-tr-full bg-cyan-100/50" />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-lg"><Package size={21} /></div>
            <div><p className="font-bold text-slate-900">Exalore ERP</p><p className="text-xs text-slate-500">Administrator portal</p></div>
          </div>

          <div className="mb-8">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <ShieldCheck size={23} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your administrator credentials to access the ERP workspace.
            </p>
          </div>

          <div
            onClick={() => setCredentials({ username: "admin", password: "qwerty" })}
            className="mb-6 cursor-pointer rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 transition-colors hover:bg-indigo-50"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setCredentials({ username: "admin", password: "qwerty" })
              }
            }}
          >
            <p className="mb-1 text-sm font-medium text-indigo-900">Admin Credentials</p>
            <div className="flex items-center gap-4 text-sm text-indigo-700">
              <span className="flex items-center gap-1.5"><UserRound size={14} /> admin</span>
              <span className="flex items-center gap-1.5"><LockKeyhole size={14} /> qwerty</span>
            </div>
            <p className="mt-2 text-xs text-indigo-500 font-medium">Click anywhere here to autofill</p>
          </div>

          <form className="space-y-5" onSubmit={submit}>
            {error && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
                {error}
              </div>
            )}
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-700">Username</span>
              <div className="relative">
                <UserRound className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                <Input autoFocus required autoComplete="username" value={credentials.username} placeholder="Enter admin username" className="h-12 bg-white pl-11 shadow-sm" onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))} />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-700">Password</span>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-3.5 text-slate-400" size={17} />
                <Input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={credentials.password} placeholder="Enter password" className="h-12 bg-white pl-11 pr-11 shadow-sm" onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            <Button type="submit" disabled={isSubmitting} className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-sm shadow-lg shadow-indigo-600/20 hover:from-indigo-700 hover:to-indigo-800">
              {isSubmitting && <LoaderCircle className="animate-spin" size={16} />}
              {isSubmitting ? "Signing in..." : "Sign in to workspace"}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <LockKeyhole size={13} /> JWT-secured administrator access
          </div>
        </div>
      </section>
    </main>
  )
}
