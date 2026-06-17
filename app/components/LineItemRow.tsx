'use client';

import { X } from 'lucide-react';

const GST_OPTIONS = [0, 3, 5, 12, 18, 28];

export interface LineItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
  gstRate: number;
}

interface LineItemRowProps {
  item: LineItem;
  index: number;
  total: number;
  onUpdate: (id: string, field: keyof LineItem, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export default function LineItemRow({
  item,
  index,
  total,
  onUpdate,
  onRemove,
  canRemove,
}: LineItemRowProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 mb-2 group transition-all hover:bg-gray-100/80">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center w-full">
        {/* Item name */}
        <div className="flex-1 min-w-0">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider sm:hidden mb-1 block">
            Item Name
          </label>
          <input
            type="text"
            value={item.name || ''}
            onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
            placeholder={`Item ${index + 1}`}
            className="text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg px-3 py-1.5 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>

        <div className="w-full sm:w-[80px]">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider sm:hidden mb-1 block">
            Qty
          </label>
          <input
            type="number"
            value={item.qty || ''}
            onChange={(e) => onUpdate(item.id, 'qty', e.target.value)}
            min={0}
            placeholder="0"
            className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1.5 w-full text-center focus:border-blue-400 outline-none transition-colors"
          />
        </div>

        {/* Rate */}
        <div className="w-full sm:w-[80px]">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider sm:hidden mb-1 block">
            Rate
          </label>
          <input
            type="number"
            value={item.rate || ''}
            onChange={(e) => onUpdate(item.id, 'rate', e.target.value)}
            min={0}
            step="0.01"
            placeholder="0.00"
            className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1.5 w-full text-center focus:border-blue-400 outline-none transition-colors"
          />
        </div>

        {/* GST% dropdown */}
        <div className="w-full sm:w-[70px]">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider sm:hidden mb-1 block">
            GST%
          </label>
          <select
            value={item.gstRate}
            onChange={(e) =>
              onUpdate(item.id, 'gstRate', Number(e.target.value))
            }
            className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1.5 w-full text-center focus:border-blue-400 outline-none transition-colors cursor-pointer appearance-none"
          >
            {GST_OPTIONS.map((rate) => (
              <option key={rate} value={rate}>
                {rate}%
              </option>
            ))}
          </select>
        </div>

        {/* Total (computed, read-only) */}
        <div className="w-full sm:w-[90px] text-right sm:text-center">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider sm:hidden block mb-1">
            Total
          </label>
          <div className="text-sm font-semibold text-gray-900 sm:py-1.5">
            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Remove button */}
        <div className="w-full sm:w-[28px] flex justify-end sm:justify-center mt-1 sm:mt-0">
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 flex-shrink-0"
              title="Remove item"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
