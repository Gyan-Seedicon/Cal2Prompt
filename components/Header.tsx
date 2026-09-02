'use client';

import React from 'react';
import { FileText } from 'lucide-react';

interface HeaderProps {
  dataSource: 'mock' | 'live';
  selectedDate: string;
  onSelectPreset: (date: string) => void;
}

export function Header({ dataSource, selectedDate, onSelectPreset }: HeaderProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] sticky top-0 z-40 border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center shadow-xs text-white">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-stone-900">
                Content calendar scraper
              </h1>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  dataSource === 'live'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-orange-50 text-orange-800'
                }`}
                title={
                  dataSource === 'live'
                    ? 'Connected to live Google Sheets'
                    : 'Running on realistic mock sheets for end-to-end preview'
                }
              >
                {dataSource === 'live' ? '● Live sheets' : '● Mock mode'}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal">
              Multi-product calendar parser & instant copy markdown generator
            </p>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-stone-400 font-medium hidden sm:inline mr-1">Presets:</span>
          <button
            type="button"
            id="preset-demo-date"
            onClick={() => onSelectPreset('2026-09-03')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedDate === '2026-09-03'
                ? 'bg-orange-500 text-white shadow-xs font-semibold'
                : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600 font-medium'
            }`}
          >
            03 Sep 2026 (demo)
          </button>
          <button
            type="button"
            id="preset-today"
            onClick={() => onSelectPreset(todayStr)}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedDate === todayStr
                ? 'bg-orange-500 text-white shadow-xs font-semibold'
                : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600 font-medium'
            }`}
          >
            Today
          </button>
        </div>
      </div>
    </header>
  );
}
