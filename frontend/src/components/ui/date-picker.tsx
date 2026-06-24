import type { ComponentProps } from "react"

import { Input } from "@/components/ui/input"

export function DatePicker(props: Omit<ComponentProps<typeof Input>, "type">) {
  return <Input type="date" {...props} />
}
