'use client';

import React from 'react';
import { Search, Layers } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

interface SearchBarProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  totalRows: number;
  productNames: string[];
  productCounts: Map<string, number>;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export function SearchBar({
  selectedDate,
  onChangeDate,
  onSubmit,
  loading,
  totalRows,
  productNames,
  productCounts,
  selectedFilter,
  onSelectFilter,
}: SearchBarProps) {
  return (
    <section className="bg-white rounded-xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-stone-100">
      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="text-xs font-bold text-stone-600 shrink-0">
            Target date
          </div>

          <div className="flex-1 max-w-xs">
            <CustomDatePicker
              id="custom-date-picker"
              value={selectedDate}
              onChange={onChangeDate}
            />
          </div>

          <button
            type="submit"
            id="get-content-btn"
            disabled={loading || !selectedDate}
            className="inline-flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Pulling sheets...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Get content for this date</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Product Filter Pills */}
      {totalRows > 0 && (
        <>
          <div className="h-px bg-stone-100 my-3.5" />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-stone-400 mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-stone-400" />
              Products:
            </span>
            <button
              type="button"
              id="filter-all"
              onClick={() => onSelectFilter('ALL')}
              className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                selectedFilter === 'ALL'
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600 font-medium'
              }`}
            >
              All products ({totalRows})
            </button>
            {productNames.map((prodName) => {
              const count = productCounts.get(prodName) || 0;
              return (
                <button
                  key={prodName}
                  type="button"
                  id={`filter-${prodName.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectFilter(prodName)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedFilter === prodName
                      ? 'bg-orange-500 text-white font-semibold shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600 font-medium'
                  }`}
                >
                  {prodName} ({count})
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
