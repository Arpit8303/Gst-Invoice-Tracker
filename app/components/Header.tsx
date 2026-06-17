'use client';

import { Receipt } from 'lucide-react';

interface HeaderProps {
  invoiceNo: string;
  date: string;
  onInvoiceNoChange: (val: string) => void;
}

export default function Header({
  invoiceNo,
  date,
  onInvoiceNoChange,
}: HeaderProps) {
  return (
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
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => onInvoiceNoChange(e.target.value)}
              className="text-xs text-gray-500 bg-transparent border-none p-0 w-[120px] focus:text-gray-800 focus:ring-0 focus:shadow-none cursor-text"
              title="Click to edit invoice number"
            />
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        </div>
      </div>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        Draft
      </span>
    </div>
  );
}
