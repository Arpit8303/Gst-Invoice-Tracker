'use client';

import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex flex-col items-center gap-3">
        {/* Digital Heroes button — MANDATORY */}
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          Built for Digital Heroes
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Developer info — MANDATORY */}
        <div className="text-center">
          <p className="text-xs text-gray-500 font-medium">Arpit Tiwari</p>
          <p className="text-xs text-gray-400">arpittiwari1200@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
