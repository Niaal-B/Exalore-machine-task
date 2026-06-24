import * as React from "react"

import { cn } from "@/lib/utils"

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "input-base appearance-none bg-[linear-gradient(45deg,transparent_50%,#94a3b8_50%),linear-gradient(135deg,#94a3b8_50%,transparent_50%)] bg-[position:calc(100%-16px)_17px,calc(100%-11px)_17px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-9",
      className,
    )}
    {...props}
  >
    {children}
  </select>
))

Select.displayName = "Select"
