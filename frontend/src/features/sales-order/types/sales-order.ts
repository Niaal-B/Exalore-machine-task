export interface SalesOrderForm {
  salesOrderNo: string
  salesOrderType: string
  issueDate: string
  validDate: string
  quotationNo: string
  customerPo: string
  customer: string
  salesExecutive: string
  deliveryPlace: string
  currency: string
  exchangeRate: string
  notes: string
}

export interface SalesOrderLine {
  id: number
  itemCode: string
  description: string
  unit: string
  quantity: string
  rate: string
  discountPercentage: string
  discountAmount: string
  netAmount: string
  vatPercentage: string
  vatAmount: string
  netAfterVat: string
}

export const DUMMY_SALES_ORDER: SalesOrderForm = {
  salesOrderNo: "SO-20260624-0001",
  salesOrderType: "normal",
  issueDate: "2026-06-24",
  validDate: "2026-07-24",
  quotationNo: "SQ-20260620-A81F2C",
  customerPo: "PO-ALN-1048",
  customer: "CUST-001 - Al Noor Trading",
  salesExecutive: "Ahmed Al-Farsi",
  deliveryPlace: "Riyadh Showroom",
  currency: "SAR",
  exchangeRate: "1.00000000",
  notes: "Deliver during normal business hours.",
}

export const DUMMY_SALES_ORDER_LINES: SalesOrderLine[] = [
  {
    id: 1,
    itemCode: "ITM-1001",
    description: "USB Keyboard - full-size office keyboard",
    unit: "Box",
    quantity: "2",
    rate: "240.0000",
    discountPercentage: "5.0000",
    discountAmount: "24.0000",
    netAmount: "456.0000",
    vatPercentage: "15.0000",
    vatAmount: "68.4000",
    netAfterVat: "524.4000",
  },
  {
    id: 2,
    itemCode: "ITM-1002",
    description: "Premium blue ballpoint pens",
    unit: "Pack",
    quantity: "5",
    rate: "31.0000",
    discountPercentage: "0.0000",
    discountAmount: "0.0000",
    netAmount: "155.0000",
    vatPercentage: "15.0000",
    vatAmount: "23.2500",
    netAfterVat: "178.2500",
  },
  {
    id: 3,
    itemCode: "ITM-3010",
    description: "On-site installation service",
    unit: "Hr",
    quantity: "3",
    rate: "55.0000",
    discountPercentage: "0.0000",
    discountAmount: "0.0000",
    netAmount: "165.0000",
    vatPercentage: "0.0000",
    vatAmount: "0.0000",
    netAfterVat: "165.0000",
  },
]
