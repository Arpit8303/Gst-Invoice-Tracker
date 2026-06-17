import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { Receipt, Download } from 'lucide-react';
import Footer from '@/components/Footer';

function formatINR(amount: number): string {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Ensure dynamic rendering
export const dynamic = 'force-dynamic';

export default async function InvoiceView({ params }: { params: { id: string } }) {
  const { id } = params;

  let invoice;
  try {
    invoice = await prisma.invoice.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return notFound();
  }

  if (!invoice) {
    return notFound();
  }

  const lineItems: any[] = invoice.lineItems as any[];

  return (
    <div className="max-w-[480px] mx-auto p-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                GST Invoice
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 font-medium">
                  {invoice.invoiceNo}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{invoice.date}</span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Final
          </span>
        </div>

        {/* From & To */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
              From
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {invoice.businessName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">GSTIN: {invoice.gstin}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
              Bill to
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {invoice.customerName}
            </p>
            {invoice.customerGstin && (
              <p className="text-xs text-gray-500 mt-0.5">
                GSTIN: {invoice.customerGstin}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs text-gray-500">
            Supply Type: <span className="font-medium text-gray-800">{invoice.supplyType === 'intra' ? 'Intra-State' : 'Inter-State'}</span>
          </p>
        </div>

        {/* Line Items */}
        <div className="mb-2">
          <div className="hidden sm:grid grid-cols-[1fr_50px_70px_50px_70px] gap-3 px-3 mb-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
              Item
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider text-center">
              Qty
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider text-center">
              Rate
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider text-center">
              GST%
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider text-right">
              Total
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {lineItems.map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-3">
              <div className="grid grid-cols-[1fr] gap-2 sm:grid-cols-[1fr_50px_70px_50px_70px] sm:items-center sm:gap-3">
                <span className="text-sm font-medium text-gray-800">
                  {item.name || 'Item'}
                </span>
                
                <div className="flex justify-between sm:contents">
                   <div className="flex-1 sm:flex-none text-center sm:text-center text-sm text-gray-600">
                      <span className="sm:hidden text-xs text-gray-400 mr-2">Qty:</span>
                      {item.qty}
                   </div>
                   <div className="flex-1 sm:flex-none text-center sm:text-center text-sm text-gray-600">
                      <span className="sm:hidden text-xs text-gray-400 mr-2">Rate:</span>
                      {item.rate}
                   </div>
                   <div className="flex-1 sm:flex-none text-center sm:text-center text-sm text-gray-600">
                      <span className="sm:hidden text-xs text-gray-400 mr-2">GST%:</span>
                      {item.gstRate}%
                   </div>
                   <div className="flex-1 sm:flex-none text-right text-sm font-medium text-gray-900">
                      <span className="sm:hidden text-xs text-gray-400 mr-2">Total:</span>
                      ₹{formatINR(item.total)}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-gray-50 rounded-xl p-4 mt-4 mb-6">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-sm text-gray-800 font-medium tabular-nums">
              ₹{formatINR(invoice.subtotal)}
            </span>
          </div>

          {invoice.supplyType === 'intra' ? (
            <>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-500">CGST</span>
                <span className="text-sm text-gray-800 font-medium tabular-nums">
                  ₹{formatINR(invoice.cgst)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-500">SGST</span>
                <span className="text-sm text-gray-800 font-medium tabular-nums">
                  ₹{formatINR(invoice.sgst)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-500">IGST</span>
              <span className="text-sm text-gray-800 font-medium tabular-nums">
                ₹{formatINR(invoice.igst)}
              </span>
            </div>
          )}

          <div className="border-t border-gray-200 my-2" />

          <div className="flex items-center justify-between py-1">
            <span className="text-base font-semibold text-gray-900">
              Grand Total
            </span>
            <span className="text-lg font-bold text-gray-900 tabular-nums">
              ₹{formatINR(invoice.grandTotal)}
            </span>
          </div>
        </div>

        {/* Download PDF button */}
        <a
          href={`/api/invoices/${invoice.id}/pdf`}
          download
          className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
