import type {
  ReactNode,
  SelectHTMLAttributes,
} from "react"

import { cn } from "@/lib/utils"

export function FormField({
  label,
  required,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <label className={className}>
      <span className="field-label">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  )
}

export function SelectField({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "input-base appearance-none bg-[linear-gradient(45deg,transparent_50%,#94a3b8_50%),linear-gradient(135deg,#94a3b8_50%,transparent_50%)] bg-[position:calc(100%-16px)_17px,calc(100%-11px)_17px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-9",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
