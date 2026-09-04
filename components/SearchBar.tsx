'use client';

import React from 'react';
import {
  Layers,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';
import {
  getTodayYMD,
  getThisWeekRange,
  getNext7DaysRange,
} from '@/lib/date-utils';

interface SearchBarProps {
  selectedDates: string[];
  onChangeDates: (dates: string[]) => void;
  onSubmit: (e?: React.FormEvent) => void;
  loading: boolean;
  totalRows: number;
  productNames: string[];
  productCounts: Map<string, number>;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  completedCount: number;
  onClearCompleted: () => void;
}

export function SearchBar({
  selectedDates,
  onChangeDates,
  onSubmit,
  loading,
  totalRows,
  productNames,
  productCounts,
  selectedFilter,
  onSelectFilter,
  completedCount,
  onClearCompleted,
}: SearchBarProps) {
  const todayStr = getTodayYMD();
  const thisWeekRange = getThisWeekRange(todayStr);
  const next7DaysRange = getNext7DaysRange(todayStr);

  const handleQuickPreset = (dates: string[]) => {
    onChangeDates(dates);
  };

  const isTodayActive =
    selectedDates.length === 1 && selectedDates[0] === todayStr;
  const isThisWeekActive =
    selectedDates.length > 1 &&
    JSON.stringify(selectedDates) === JSON.stringify(thisWeekRange.dates);
  const isNext7DaysActive =
    selectedDates.length > 1 &&
    JSON.stringify(selectedDates) === JSON.stringify(next7DaysRange.dates);
  const isDemoActive =
    selectedDates.length === 1 && selectedDates[0] === '2026-09-03';

  return (
    <div className="space-y-4">
      {/* Top Surface Bar: Date Picker + Quick Presets + Sync */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Date Picker + Refresh */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <div className="flex-1">
            <CustomDatePicker
              id="custom-date-picker"
              selectedDates={selectedDates}
              onChangeDates={onChangeDates}
            />
          </div>
          <button
            type="button"
            id="refresh-sheets-btn"
            onClick={() => onSubmit()}
            disabled={loading}
            className="p-2 bg-white hover:bg-stone-100 active:scale-95 text-stone-600 hover:text-stone-900 rounded-lg border border-stone-200/80 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Refresh & sync live sheets"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`}
            />
          </button>
        </div>

        {/* Right: Quick Range Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            id="preset-today"
            onClick={() => handleQuickPreset([todayStr])}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isTodayActive
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            id="preset-this-week"
            onClick={() => handleQuickPreset(thisWeekRange.dates)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isThisWeekActive
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80'
            }`}
          >
            This week
          </button>
          <button
            type="button"
            id="preset-next-7-days"
            onClick={() => handleQuickPreset(next7DaysRange.dates)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isNext7DaysActive
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80'
            }`}
          >
            Next 7 days
          </button>
          <button
            type="button"
            id="preset-demo"
            onClick={() => handleQuickPreset(['2026-09-03'])}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isDemoActive
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-orange-50/80 hover:bg-orange-100/80 text-orange-800 border border-orange-200/60'
            }`}
          >
            03 Sep (demo)
          </button>
        </div>
      </div>

      {/* Surface Filters & Completion Tracker */}
      {totalRows > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
          {/* Product Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-stone-400 font-medium mr-1 flex items-center gap-1 text-xs">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              Products:
            </span>
            <button
              type="button"
              id="filter-all"
              onClick={() => onSelectFilter('ALL')}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedFilter === 'ALL'
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80 font-medium'
              }`}
            >
              All ({totalRows})
            </button>
            {productNames.map((prodName) => {
              const count = productCounts.get(prodName) || 0;
              const isSelected = selectedFilter === prodName;
              return (
                <button
                  key={prodName}
                  type="button"
                  id={`filter-${prodName.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectFilter(prodName)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white font-semibold shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80 font-medium'
                  }`}
                >
                  {prodName} ({count})
                </button>
              );
            })}
          </div>

          {/* Completion Status */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200/80 text-stone-700 text-xs shadow-2xs">
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  completedCount > 0 ? 'text-emerald-600' : 'text-stone-400'
                }`}
              />
              <span>
                Completed:{' '}
                <strong className="text-stone-900 font-bold">
                  {completedCount}
                </strong>
                /{totalRows}
              </span>
            </div>

            {completedCount > 0 && (
              <button
                type="button"
                id="reset-completed-btn"
                onClick={onClearCompleted}
                className="text-stone-400 hover:text-stone-700 font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset completion status"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

