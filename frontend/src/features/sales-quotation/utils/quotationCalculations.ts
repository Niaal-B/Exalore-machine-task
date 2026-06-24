import type { QuotationLine } from "@/features/sales-quotation/types/quotation-line"

const SCALE = 1_000_000n
const ONE_HUNDRED = 100n * SCALE

function parseDecimal(value: string): bigint {
  const match = value.trim().match(/^(\d*)(?:\.(\d*))?$/)
  if (!match) return 0n

  const whole = match[1] || "0"
  const fraction = (match[2] || "").slice(0, 6).padEnd(6, "0")
  return BigInt(whole) * SCALE + BigInt(fraction)
}

function formatMoney(value: bigint): string {
  const rounded = (value + 50n) / 100n
  const whole = rounded / 10_000n
  const fraction = (rounded % 10_000n).toString().padStart(4, "0")
  return `${whole}.${fraction}`
}

export function calculateQuotationLine(line: QuotationLine): QuotationLine {
  const quantity = parseDecimal(line.quantity)
  const rate = parseDecimal(line.rate)
  const discountPercentage = parseDecimal(line.discountPercentage)
  const vatPercentage = parseDecimal(line.vatPercentage)

  const gross = (quantity * rate) / SCALE
  const discountAmount = (gross * discountPercentage) / ONE_HUNDRED
  const netAmount = gross - discountAmount
  const vatAmount = (netAmount * vatPercentage) / ONE_HUNDRED

  return {
    ...line,
    discountAmount: formatMoney(discountAmount),
    netAmount: formatMoney(netAmount),
    vatAmount: formatMoney(vatAmount),
    netAfterVat: formatMoney(netAmount + vatAmount),
  }
}
