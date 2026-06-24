import type { QuotationLine } from "@/features/sales-quotation/types/quotation-line"

export interface QuotationTotals {
  grossAmount: number
  discountAmount: number
  netAmount: number
  vatAmount: number
  netAfterVat: number
}

const MONEY_SCALE = 10_000n

function parseMoney(value: string): bigint {
  const match = value.trim().match(/^(\d*)(?:\.(\d*))?$/)
  if (!match) return 0n

  const whole = match[1] || "0"
  const fraction = (match[2] || "").slice(0, 4).padEnd(4, "0")
  return BigInt(whole) * MONEY_SCALE + BigInt(fraction)
}

function toNumber(value: bigint): number {
  return Number(value) / Number(MONEY_SCALE)
}

export function calculateQuotationTotals(
  lines: QuotationLine[],
): QuotationTotals {
  let grossAmount = 0n
  let discountAmount = 0n
  let netAmount = 0n
  let vatAmount = 0n
  let netAfterVat = 0n

  for (const line of lines) {
    const quantity = BigInt(/^\d+$/.test(line.quantity) ? line.quantity : "0")
    grossAmount += quantity * parseMoney(line.rate)
    discountAmount += parseMoney(line.discountAmount)
    netAmount += parseMoney(line.netAmount)
    vatAmount += parseMoney(line.vatAmount)
    netAfterVat += parseMoney(line.netAfterVat)
  }

  return {
    grossAmount: toNumber(grossAmount),
    discountAmount: toNumber(discountAmount),
    netAmount: toNumber(netAmount),
    vatAmount: toNumber(vatAmount),
    netAfterVat: toNumber(netAfterVat),
  }
}
