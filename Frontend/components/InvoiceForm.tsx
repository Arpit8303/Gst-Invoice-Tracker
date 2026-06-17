'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Download, RotateCcw, Link2, Loader2 } from 'lucide-react';
import Header from './Header';
import LineItemRow, { LineItem } from './LineItemRow';
import SummaryCard from './SummaryCard';
import Footer from './Footer';

// ---- Types ----
interface CalculatedItem {
  name: string;
  qty: number;
  rate: number;
  gstRate: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  tax: number;
  total: number;
}

interface Totals {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  exiting?: boolean;
}

// ---- Helpers ----
function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyItem(): LineItem {
  return { id: generateId(), name: '', qty: 1, rate: 0, gstRate: 18 };
}

function generateInvoiceNo(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `INV-${year}-${rand}`;
}

function todayFormatted(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}/${d.getFullYear()}`;
}

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const STORAGE_KEY = 'gst-invoice-form-state';

// ---- Component ----
export default function InvoiceForm() {
  // Form state
  const [invoiceNo, setInvoiceNo] = useState(generateInvoiceNo());
  const [date] = useState(todayFormatted());
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [supplyType, setSupplyType] = useState<'intra' | 'inter'>('intra');
  const [lineItems, setLineItems] = useState<LineItem[]>([createEmptyItem()]);

  // Calculated
  const [calculatedItems, setCalculatedItems] = useState<CalculatedItem[]>([]);
  const [totals, setTotals] = useState<Totals>({
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalTax: 0,
    grandTotal: 0,
  });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [gstinError, setGstinError] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const toastIdRef = useRef(0);

  // ---- Toast ----
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, 3000);
    },
    [],
  );

  // ---- LocalStorage restore ----
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.invoiceNo) setInvoiceNo(data.invoiceNo);
        if (data.businessName) setBusinessName(data.businessName);
        if (data.gstin) setGstin(data.gstin);
        if (data.customerName) setCustomerName(data.customerName);
        if (data.customerGstin) setCustomerGstin(data.customerGstin);
        if (data.supplyType) setSupplyType(data.supplyType);
        if (data.lineItems?.length > 0) {
          const validItems = data.lineItems.map((item: LineItem) => ({
            ...item,
            id: item.id || generateId()
          }));
          setLineItems(validItems);
        }
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // ---- LocalStorage save ----
  useEffect(() => {
    if (!hydrated) return;
    const data = {
      invoiceNo,
      businessName,
      gstin,
      customerName,
      customerGstin,
      supplyType,
      lineItems,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage full or unavailable
    }
  }, [
    invoiceNo,
    businessName,
    gstin,
    customerName,
    customerGstin,
    supplyType,
    lineItems,
    hydrated,
  ]);

  // ---- GSTIN validation ----
  useEffect(() => {
    if (gstin.length === 0) {
      setGstinError(false);
    } else {
      setGstinError(!GSTIN_REGEX.test(gstin.toUpperCase()));
    }
  }, [gstin]);

  // ---- Server-side calculation (debounced) ----
  const doCalculate = useCallback(
    async (items: LineItem[], st: 'intra' | 'inter') => {
      try {
        const payload = items.map((i) => ({
          name: i.name,
          qty: Number(i.qty) || 0,
          rate: Number(i.rate) || 0,
          gstRate: Number(i.gstRate) || 0,
        }));

        const res = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lineItems: payload, supplyType: st }),
        });

        if (!res.ok) throw new Error('Calculation failed');

        const data = await res.json();
        setCalculatedItems(data.items);
        setTotals(data.totals);
      } catch (err) {
        console.error('Calculate error:', err);
      }
    },
    [],
  );

  useEffect(() => {
    if (!hydrated) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      doCalculate(lineItems, supplyType);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [lineItems, supplyType, doCalculate, hydrated]);

  const updateItem = (
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    setLineItems((prev) => [...prev, createEmptyItem()]);
  };

  // ---- Reset ----
  const handleReset = () => {
    setInvoiceNo(generateInvoiceNo());
    setBusinessName('');
    setGstin('');
    setCustomerName('');
    setCustomerGstin('');
    setSupplyType('intra');
    setLineItems([createEmptyItem()]);
    setCalculatedItems([]);
    setTotals({
      subtotal: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalTax: 0,
      grandTotal: 0,
    });
    setShareUrl(null);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Invoice reset', 'info');
  };

  // ---- Save ----
  const handleSave = async () => {
    if (!businessName.trim()) {
      showToast('Business name is required', 'error');
      return;
    }
    if (!gstin.trim()) {
      showToast('GSTIN is required', 'error');
      return;
    }
    if (gstinError) {
      showToast('Please enter a valid GSTIN', 'error');
      return;
    }
    if (!customerName.trim()) {
      showToast('Customer name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        invoiceNo,
        date,
        businessName: businessName.trim(),
        gstin: gstin.trim().toUpperCase(),
        customerName: customerName.trim(),
        customerGstin: customerGstin.trim().toUpperCase() || undefined,
        supplyType,
        lineItems: lineItems.map((i) => ({
          name: i.name || 'Untitled Item',
          qty: Number(i.qty) || 0,
          rate: Number(i.rate) || 0,
          gstRate: Number(i.gstRate) || 0,
        })),
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      const { id } = await res.json();
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const url = `${baseUrl}/invoice/${id}`;
      setShareUrl(url);

      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        showToast('Invoice saved! Link copied to clipboard', 'success');
      } catch {
        showToast('Invoice saved! Share link is ready', 'success');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast(
        err instanceof Error ? err.message : 'Failed to save invoice',
        'error',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Download PDF (from saved invoice) ----
  const handleDownloadPDF = async () => {
    // First save, then download PDF
    if (!businessName.trim() || !gstin.trim() || !customerName.trim()) {
      showToast('Fill in all required fields first', 'error');
      return;
    }
    if (gstinError) {
      showToast('Please enter a valid GSTIN', 'error');
      return;
    }

    setIsDownloading(true);
    try {
      // Save first
      const payload = {
        invoiceNo,
        date,
        businessName: businessName.trim(),
        gstin: gstin.trim().toUpperCase(),
        customerName: customerName.trim(),
        customerGstin: customerGstin.trim().toUpperCase() || undefined,
        supplyType,
        lineItems: lineItems.map((i) => ({
          name: i.name || 'Untitled Item',
          qty: Number(i.qty) || 0,
          rate: Number(i.rate) || 0,
          gstRate: Number(i.gstRate) || 0,
        })),
      };

      const saveRes = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) throw new Error('Failed to save invoice');

      const { id } = await saveRes.json();

      // Download PDF
      const pdfRes = await fetch(`/api/invoices/${id}/pdf`);
      if (!pdfRes.ok) throw new Error('Failed to generate PDF');

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('PDF downloaded successfully', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('Failed to generate PDF', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // Get per-item totals from calculated items, fallback to local calc
  const getItemTotal = (index: number): number => {
    if (calculatedItems[index]) {
      return calculatedItems[index].total;
    }
    const item = lineItems[index];
    const taxable = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    const tax = (taxable * (Number(item.gstRate) || 0)) / 100;
    return taxable + tax;
  };

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto p-4 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
          <div className="h-10 bg-gray-100 rounded mb-3" />
          <div className="h-10 bg-gray-100 rounded mb-3" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
              toast.exiting ? 'toast-exit' : 'toast-enter'
            } ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : toast.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto p-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {/* Header */}
          <Header
            invoiceNo={invoiceNo}
            date={date}
            onInvoiceNoChange={setInvoiceNo}
          />

          {/* From section */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
              From
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Business Name"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="GSTIN (15 digits)"
                  maxLength={15}
                  className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white placeholder:text-gray-400 transition-colors ${
                    gstinError
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-400'
                  }`}
                />
                {gstinError && (
                  <p className="text-xs text-red-500 mt-1">Invalid GSTIN format</p>
                )}
              </div>
            </div>
          </div>

          {/* Bill To section */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
              Bill to
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                  placeholder="GSTIN (optional)"
                  maxLength={15}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 focus:border-blue-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Supply Type Toggle */}
          <div className="mb-5">
            <div className="pill-toggle w-full">
              <button
                type="button"
                className={`flex-1 ${supplyType === 'intra' ? 'active' : ''}`}
                onClick={() => setSupplyType('intra')}
              >
                Intra-state
              </button>
              <button
                type="button"
                className={`flex-1 ${supplyType === 'inter' ? 'active' : ''}`}
                onClick={() => setSupplyType('inter')}
              >
                Inter-state
              </button>
            </div>
          </div>

          {/* Line Items Header */}
          <div className="mb-2">
            <div className="hidden sm:flex gap-3 px-3 mb-1">
              <span className="flex-1 text-[10px] text-gray-400 uppercase tracking-wider">
                Item
              </span>
              <span className="w-[80px] text-[10px] text-gray-400 uppercase tracking-wider text-center">
                Qty
              </span>
              <span className="w-[80px] text-[10px] text-gray-400 uppercase tracking-wider text-center">
                Rate
              </span>
              <span className="w-[70px] text-[10px] text-gray-400 uppercase tracking-wider text-center">
                GST%
              </span>
              <span className="w-[90px] text-[10px] text-gray-400 uppercase tracking-wider text-center">
                Total
              </span>
              <span className="w-[28px]" />
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-0">
            {lineItems.map((item, idx) => (
              <LineItemRow
                key={item.id}
                item={item}
                index={idx}
                total={getItemTotal(idx)}
                onUpdate={updateItem}
                onRemove={removeItem}
                canRemove={lineItems.length > 1}
              />
            ))}
          </div>

          {/* Add item button */}
          <button
            type="button"
            onClick={addItem}
            className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-blue-300 text-blue-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add item
          </button>

          {/* Summary */}
          <SummaryCard
            supplyType={supplyType}
            subtotal={totals.subtotal}
            cgst={totals.cgst}
            sgst={totals.sgst}
            igst={totals.igst}
            grandTotal={totals.grandTotal}
          />

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors flex-shrink-0"
              title="Reset invoice"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Save & Share */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full mt-3 py-2.5 rounded-xl border border-blue-200 text-blue-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save & Get Shareable Link'}
          </button>

          {/* Share URL display */}
          {shareUrl && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-xs text-emerald-700 font-medium mb-1">
                ✓ Invoice saved! Shareable link:
              </p>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 underline break-all"
              >
                {shareUrl}
              </a>
            </div>
          )}

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
}
