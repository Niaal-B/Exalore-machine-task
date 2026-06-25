export interface PrintableSalesDocumentLine {
  lineNo: number
  itemCode: string
  description: string
  unit: string
  quantity: string
  rate: string
  discountPercentage: string
  netAmount: string
  vatAmount: string
  netAfterVat: string
}

export interface PrintableSalesDocument {
  title: "Sales Quotation" | "Sales Order"
  documentNumber: string
  documentDate: string
  status: string
  isDraftPreview: boolean
  customerCode: string
  customerName: string
  currency: string
  exchangeRate: string
  references: Array<{ label: string; value: string }>
  notes: string
  lines: PrintableSalesDocumentLine[]
  totals: {
    grossAmount: string
    discountAmount: string
    netAmount: string
    vatAmount: string
    netAfterVat: string
  }
  template?: {
    headerImageUrl: string | null
    footerImageUrl: string | null
    primaryColor: string
  }
}
