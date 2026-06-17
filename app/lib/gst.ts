// ============================================================
// GST Calculation Helpers — server-side source of truth
// ============================================================

export type SupplyType = 'intra' | 'inter';

export interface LineItemInput {
  name: string;
  qty: number;
  rate: number;
  gstRate: number; // 0, 3, 5, 12, 18, 28
}

export interface LineItemResult extends LineItemInput {
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  tax: number;
  total: number;
}

export interface InvoiceTotals {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number;
}

export interface CalculationResult {
  items: LineItemResult[];
  totals: InvoiceTotals;
}

/**
 * Calculate GST breakdown for a list of line items.
 * This is the single source of truth — called from /api/calculate.
 */
export function calculateGST(
  items: LineItemInput[],
  supplyType: SupplyType,
): CalculationResult {
  const calculatedItems: LineItemResult[] = items.map((item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const gstRate = Number(item.gstRate) || 0;

    const taxable = round2(qty * rate);
    const totalTax = round2((taxable * gstRate) / 100);

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (supplyType === 'intra') {
      cgst = round2(totalTax / 2);
      sgst = round2(totalTax / 2);
    } else {
      igst = round2(totalTax);
    }

    const total = round2(taxable + totalTax);

    return {
      ...item,
      qty,
      rate,
      gstRate,
      taxable,
      cgst,
      sgst,
      igst,
      tax: totalTax,
      total,
    };
  });

  const subtotal = round2(
    calculatedItems.reduce((acc, i) => acc + i.taxable, 0),
  );
  const totalCgst = round2(
    calculatedItems.reduce((acc, i) => acc + i.cgst, 0),
  );
  const totalSgst = round2(
    calculatedItems.reduce((acc, i) => acc + i.sgst, 0),
  );
  const totalIgst = round2(
    calculatedItems.reduce((acc, i) => acc + i.igst, 0),
  );
  const totalTax = round2(totalCgst + totalSgst + totalIgst);
  const grandTotal = round2(subtotal + totalTax);

  return {
    items: calculatedItems,
    totals: {
      subtotal,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      totalTax,
      grandTotal,
    },
  };
}

/** Round to 2 decimal places */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Format a number as Indian currency string (₹ 1,23,456.78) */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format a number as Indian currency for PDF (Rs. 1,23,456.78) - without Unicode rupee symbol */
export function formatINRForPDF(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Rs. ${formatted}`;
}

/** Validate a GSTIN string */
export function isValidGSTIN(gstin: string): boolean {
  const regex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin);
}

/** Generate an invoice number */
export function generateInvoiceNo(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `INV-${year}-${rand}`;
}

/** Format today's date as DD/MM/YYYY */
export function todayFormatted(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}/${d.getFullYear()}`;
}
