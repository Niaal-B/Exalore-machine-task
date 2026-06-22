import type { ReactNode } from "react"

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="section-card">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}
