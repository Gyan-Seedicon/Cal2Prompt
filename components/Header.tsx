'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { getTodayYMD, getThisWeekRange } from '@/lib/date-utils';

interface HeaderProps {
  selectedDates: string[];
  onSelectDates: (dates: string[]) => void;
}

export function Header({ selectedDates, onSelectDates }: HeaderProps) {
  const todayStr = getTodayYMD();
  const thisWeekDates = getThisWeekRange(todayStr).dates;

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-stone-200/60 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-xs text-white">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-stone-900">
                Cal2Prompt
              </h1>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                title="Connected to live Google Sheets"
              >
                ● 4 Live sheets
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal hidden sm:block">
              Scrape calendar posts & generate prompts in 1-click
            </p>
          </div>
        </div>

        {/* Header Quick Links */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            id="header-preset-today"
            onClick={() => onSelectDates([todayStr])}
            className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
              selectedDates.length === 1 && selectedDates[0] === todayStr
                ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            id="header-preset-this-week"
            onClick={() => onSelectDates(thisWeekDates)}
            className="px-2.5 py-1 rounded-md text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium transition-all cursor-pointer"
          >
            This week
          </button>
          <button
            type="button"
            id="header-preset-demo"
            onClick={() => onSelectDates(['2026-09-03'])}
            className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
              selectedDates.length === 1 && selectedDates[0] === '2026-09-03'
                ? 'bg-orange-500 text-white font-semibold shadow-2xs'
                : 'text-orange-700 bg-orange-50/80 hover:bg-orange-100/80 font-medium'
            }`}
          >
            Demo
          </button>
        </div>
      </div>
    </header>
  );
}
