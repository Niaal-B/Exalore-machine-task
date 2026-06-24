import type { PrintableSalesDocument } from "@/features/sales-documents/types/printable-sales-document"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function amount(value: string, currency: string): string {
  const parsed = Number(value)
  const formatted = Number.isFinite(parsed) ? parsed.toFixed(4) : value
  return `${escapeHtml(formatted)} ${escapeHtml(currency)}`
}

function documentHtml(document: PrintableSalesDocument): string {
  const references = document.references
    .map(
      ({ label, value }) => `
        <div class="meta-item">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value || "—")}</strong>
        </div>`,
    )
    .join("")

  const rows = document.lines
    .map(
      (line) => `
        <tr>
          <td class="center">${line.lineNo}</td>
          <td class="strong">${escapeHtml(line.itemCode)}</td>
          <td>${escapeHtml(line.description)}</td>
          <td>${escapeHtml(line.unit)}</td>
          <td class="number">${escapeHtml(line.quantity)}</td>
          <td class="number">${escapeHtml(line.rate)}</td>
          <td class="number">${escapeHtml(line.discountPercentage)}</td>
          <td class="number">${escapeHtml(line.vatAmount)}</td>
          <td class="number strong">${escapeHtml(line.netAfterVat)}</td>
        </tr>`,
    )
    .join("")

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(document.documentNumber)} — ${escapeHtml(document.title)}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #eef2f7; color: #1e293b; font-family: Arial, Helvetica, sans-serif; }
    body { padding: 18px; }
    .sheet { position: relative; width: 210mm; min-height: 297mm; margin: 0 auto; overflow: hidden; background: white; box-shadow: 0 8px 35px rgba(15,23,42,.16); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding: 28px 34px; color: white; background: linear-gradient(120deg,#0f172a,#172554); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .brand { font-size: 25px; font-weight: 800; letter-spacing: 2px; }
    .tagline { margin-top: 7px; color: #cbd5e1; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; }
    .doc-title { color: #c7d2fe; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; text-align: right; }
    .doc-number { margin-top: 8px; font-size: 18px; font-weight: 700; text-align: right; }
    .status { display: inline-block; float: right; margin-top: 10px; padding: 5px 10px; border: 1px solid rgba(255,255,255,.3); border-radius: 999px; background: rgba(255,255,255,.1); font-size: 9px; text-transform: uppercase; }
    .content { position: relative; z-index: 1; padding: 28px 34px 80px; }
    .customer-grid { display: grid; grid-template-columns: 1fr 1.35fr; gap: 34px; padding-bottom: 22px; border-bottom: 1px solid #e2e8f0; }
    .eyebrow { color: #4f46e5; font-size: 9px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
    .customer-name { margin-top: 12px; font-size: 18px; font-weight: 800; }
    .customer-code { margin-top: 5px; color: #64748b; font-size: 12px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 22px; }
    .meta-item span { display: block; color: #94a3b8; font-size: 9px; }
    .meta-item strong { display: block; margin-top: 4px; font-size: 11px; }
    table { width: 100%; margin-top: 24px; border-spacing: 0; border-collapse: collapse; table-layout: fixed; font-size: 9px; }
    thead { color: white; background: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    th { padding: 10px 6px; text-align: left; }
    td { padding: 10px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    tbody tr:nth-child(even) { background: #f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .center { text-align: center; } .number { text-align: right; } .strong { font-weight: 700; }
    .summary { display: grid; grid-template-columns: 1fr 285px; gap: 35px; margin-top: 25px; }
    .notes-title { color: #64748b; font-size: 9px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
    .notes { margin-top: 10px; color: #475569; font-size: 11px; line-height: 1.6; white-space: pre-wrap; }
    .totals { padding: 17px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #64748b; font-size: 10px; }
    .total-row strong { color: #1e293b; }
    .grand-total { margin: 12px -17px -17px; padding: 14px 17px; border-radius: 0 0 10px 10px; color: white; background: #312e81; font-size: 13px; font-weight: 800; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-top: 70px; color: #64748b; font-size: 9px; text-align: center; }
    .signature { padding-top: 10px; border-top: 1px solid #94a3b8; }
    .footer { position: absolute; right: 34px; bottom: 24px; left: 34px; display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 8px; }
    .watermark { position: absolute; top: 46%; left: 50%; z-index: 0; color: rgba(15,23,42,.045); font-size: 92px; font-weight: 900; letter-spacing: 18px; transform: translate(-50%,-50%) rotate(-35deg); }
    .actions { position: fixed; top: 16px; right: 20px; z-index: 10; display: flex; gap: 8px; }
    .actions button { padding: 10px 16px; border: 0; border-radius: 7px; color: white; background: #4f46e5; cursor: pointer; font-weight: 700; }
    @media print {
      html, body { background: white; }
      body { padding: 0; }
      .sheet { width: 210mm; min-height: 297mm; box-shadow: none; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="actions"><button onclick="window.print()">Print / Save PDF</button></div>
  <main class="sheet">
    ${document.isDraftPreview ? '<div class="watermark">DRAFT</div>' : ""}
    <header class="header">
      <div><div class="brand">EXALORE</div><div class="tagline">Enterprise Resource Planning</div></div>
      <div><div class="doc-title">${escapeHtml(document.title)}</div><div class="doc-number">${escapeHtml(document.documentNumber)}</div><div class="status">${escapeHtml(document.status)}</div></div>
    </header>
    <div class="content">
      <section class="customer-grid">
        <div><div class="eyebrow">Bill To</div><div class="customer-name">${escapeHtml(document.customerName || "Customer not selected")}</div><div class="customer-code">${escapeHtml(document.customerCode || "—")}</div></div>
        <div class="meta"><div class="meta-item"><span>Document Date</span><strong>${escapeHtml(document.documentDate)}</strong></div><div class="meta-item"><span>Currency</span><strong>${escapeHtml(document.currency)}</strong></div><div class="meta-item"><span>Exchange Rate</span><strong>${escapeHtml(document.exchangeRate)}</strong></div>${references}</div>
      </section>
      <table>
        <colgroup><col style="width:5%"><col style="width:12%"><col style="width:25%"><col style="width:7%"><col style="width:8%"><col style="width:10%"><col style="width:8%"><col style="width:11%"><col style="width:14%"></colgroup>
        <thead><tr><th>#</th><th>Item</th><th>Description</th><th>Unit</th><th class="number">Qty</th><th class="number">Rate</th><th class="number">Disc %</th><th class="number">VAT</th><th class="number">Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <section class="summary">
        <div><div class="notes-title">Notes</div><div class="notes">${escapeHtml(document.notes || "No additional notes.")}</div></div>
        <div class="totals">
          <div class="total-row"><span>Gross Amount</span><strong>${amount(document.totals.grossAmount, document.currency)}</strong></div>
          <div class="total-row"><span>Discount</span><strong>${amount(document.totals.discountAmount, document.currency)}</strong></div>
          <div class="total-row"><span>Net Amount</span><strong>${amount(document.totals.netAmount, document.currency)}</strong></div>
          <div class="total-row"><span>VAT Amount</span><strong>${amount(document.totals.vatAmount, document.currency)}</strong></div>
          <div class="total-row grand-total"><span>Total</span><strong>${amount(document.totals.netAfterVat, document.currency)}</strong></div>
        </div>
      </section>
      <section class="signatures"><div class="signature">Authorized Signature</div><div class="signature">Customer Acceptance</div></section>
    </div>
    <footer class="footer"><span>Generated by Exalore ERP</span><span>Official business document</span></footer>
  </main>
</body>
</html>`
}

export function printSalesDocument(document: PrintableSalesDocument): void {
  const printWindow = window.open("", "_blank", "width=1100,height=850")
  if (!printWindow) {
    throw new Error("The print window was blocked. Allow pop-ups and try again.")
  }

  printWindow.document.open()
  printWindow.document.write(documentHtml(document))
  printWindow.document.close()
  printWindow.focus()
  window.setTimeout(() => printWindow.print(), 250)
}
