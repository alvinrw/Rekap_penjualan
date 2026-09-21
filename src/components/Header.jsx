import React from 'react';
import { Layers, Tag } from 'lucide-react';
import { formatRupiah } from '../utils/calculations';

export function Header({ activePrice, currentViewName }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-3 sm:px-8 h-14 sm:h-16 flex items-center justify-between shadow-xs font-sans gap-2">
      {/* Left Title & Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
          <Layers size={18} />
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline flex-shrink-0">Pendataan Ayam</span>
          <span className="text-slate-300 hidden sm:inline flex-shrink-0">&bull;</span>
          <h2 className="font-extrabold text-sm text-slate-900 tracking-tight truncate">
            {currentViewName}
          </h2>
        </div>
      </div>

      {/* Right Price Section — hidden on very small screens */}
      <div className="flex items-center flex-shrink-0">
        <div className="hidden xs:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
          <Tag size={13} className="text-sky-600 flex-shrink-0" />
          <span className="hidden sm:inline">Harga Acuan:</span>
          <strong className="text-slate-900 font-bold whitespace-nowrap">{formatRupiah(activePrice)}<span className="hidden sm:inline"> / ons</span></strong>
        </div>
        {/* Minimal price badge for very small screens */}
        <div className="flex xs:hidden items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
          <Tag size={11} className="text-sky-600" />
          <span>{formatRupiah(activePrice)}</span>
        </div>
      </div>
    </header>
  );
}
