'use client';

interface SummaryCardProps {
  supplyType: 'intra' | 'inter';
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
}

function formatINR(amount: number): string {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SummaryCard({
  supplyType,
  subtotal,
  cgst,
  sgst,
  igst,
  grandTotal,
}: SummaryCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 mt-4">
      {/* Subtotal */}
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-gray-500">Subtotal</span>
        <span className="text-sm text-gray-800 font-medium tabular-nums">
          ₹{formatINR(subtotal)}
        </span>
      </div>

      {/* Tax rows */}
      {supplyType === 'intra' ? (
        <>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-500">CGST</span>
            <span className="text-sm text-gray-800 font-medium tabular-nums">
              ₹{formatINR(cgst)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-gray-500">SGST</span>
            <span className="text-sm text-gray-800 font-medium tabular-nums">
              ₹{formatINR(sgst)}
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm text-gray-500">IGST</span>
          <span className="text-sm text-gray-800 font-medium tabular-nums">
            ₹{formatINR(igst)}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 my-2" />

      {/* Grand total */}
      <div className="flex items-center justify-between py-1">
        <span className="text-base font-semibold text-gray-900">
          Grand Total
        </span>
        <span className="text-lg font-bold text-gray-900 tabular-nums">
          ₹{formatINR(grandTotal)}
        </span>
      </div>
    </div>
  );
}
