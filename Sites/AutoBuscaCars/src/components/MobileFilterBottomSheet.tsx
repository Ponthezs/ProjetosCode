'use client';

import React from 'react';
import { FilterState } from '../lib/types';
import FilterSidebar from './FilterSidebar';
import { X, Check } from 'lucide-react';

interface MobileFilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  resultCount: number;
}

export default function MobileFilterBottomSheet({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  resultCount,
}: MobileFilterBottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      {/* Click backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Modal Container */}
      <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col justify-between space-y-4">
        {/* Sheet Grab Handle & Header */}
        <div className="flex flex-col items-center gap-2 sticky top-0 bg-slate-900 z-10 pb-2 border-b border-slate-800">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
          <div className="w-full flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-white">⚙️ Filtros Avançados</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Form Content */}
        <FilterSidebar filters={filters} onChange={onChange} onReset={onReset} />

        {/* Apply Action Bar */}
        <div className="sticky bottom-0 bg-slate-900 pt-3 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={onReset}
            className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm"
          >
            Limpar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Ver {resultCount} {resultCount === 1 ? 'anúncio' : 'anúncios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
