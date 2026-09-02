'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { ContentRow } from '@/lib/types';
import { formatYMDToDisplay } from '@/lib/date-utils';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { ContentCard } from '@/components/ContentCard';
import { ContentDrawer } from '@/components/ContentDrawer';
import { Toast } from '@/components/Toast';

export default function CalendarScraperPage() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-03');
  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & UI states
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drawer state for selected card
  const [selectedDrawerRow, setSelectedDrawerRow] = useState<ContentRow | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Trigger initial fetch for default date on mount
  useEffect(() => {
    fetchContentForDate('2026-09-03');
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2400);
  };

  const copyToClipboard = async (text: string, label: string, key: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedKey(key);
      showToast(`${label} copied to clipboard!`);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy to clipboard');
    }
  };

  const fetchContentForDate = async (dateToFetch: string) => {
    if (!dateToFetch) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/calendar?date=${encodeURIComponent(dateToFetch)}`);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const data: ContentRow[] = await res.json();
      setRows(data);
      setSelectedProductFilter('ALL');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContentForDate(selectedDate);
  };

  const handleSelectPreset = (date: string) => {
    setSelectedDate(date);
    fetchContentForDate(date);
  };

  // Group rows by product
  const groupedByProduct = useMemo(() => {
    const map = new Map<string, ContentRow[]>();
    for (const row of rows) {
      const prod = row.product || 'General';
      if (!map.has(prod)) {
        map.set(prod, []);
      }
      map.get(prod)!.push(row);
    }
    return map;
  }, [rows]);

  const allProductNames = useMemo(() => {
    return Array.from(groupedByProduct.keys());
  }, [groupedByProduct]);

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>();
    groupedByProduct.forEach((val, key) => {
      counts.set(key, val.length);
    });
    return counts;
  }, [groupedByProduct]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (selectedProductFilter === 'ALL') return rows;
    return rows.filter((r) => r.product === selectedProductFilter);
  }, [rows, selectedProductFilter]);

  const handleOpenDrawer = (row: ContentRow) => {
    setSelectedDrawerRow(row);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-stone-800 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-950">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Header */}
      <Header
        selectedDate={selectedDate}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-7">
        {/* Search & Filter Bar */}
        <SearchBar
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
          onSubmit={handleSubmit}
          loading={loading}
          totalRows={rows.length}
          productNames={allProductNames}
          productCounts={productCounts}
          selectedFilter={selectedProductFilter}
          onSelectFilter={setSelectedProductFilter}
        />

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 rounded-xl p-4 shadow-xs flex items-start gap-3 text-rose-900 border border-rose-100">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">Failed to fetch calendar content</p>
              <p className="text-rose-700/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-3">
            <div className="h-4 w-40 bg-stone-200/70 rounded-md animate-pulse" />
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl p-5 space-y-3 shadow-xs border border-stone-100 animate-pulse"
                >
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-stone-100 rounded-md" />
                      <div className="h-5 w-20 bg-stone-100 rounded-md" />
                    </div>
                    <div className="h-5 w-14 bg-stone-100 rounded-md" />
                  </div>
                  <div className="h-5 w-3/4 bg-stone-100 rounded-md" />
                  <div className="h-3.5 w-1/3 bg-stone-100 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && hasSearched && rows.length === 0 && !error && (
          <div className="bg-white rounded-xl p-10 text-center max-w-lg mx-auto shadow-xs border border-stone-100">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mx-auto mb-3.5 text-orange-500 shadow-xs">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-semibold text-stone-800" id="empty-state-text">
              No content scheduled for this date.
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              No matching rows were found across the configured product spreadsheets for{' '}
              <span className="text-stone-800 font-semibold">
                {formatYMDToDisplay(selectedDate)}
              </span>
              .
            </p>
            <button
              type="button"
              onClick={() => handleSelectPreset('2026-09-03')}
              className="mt-4 text-xs text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1.5 hover:underline underline-offset-4 cursor-pointer"
            >
              Try date with scheduled posts (03 Sep 2026) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && filteredRows.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <span>
                Displaying{' '}
                <strong className="text-stone-900 font-semibold">{filteredRows.length}</strong> content{' '}
                {filteredRows.length === 1 ? 'item' : 'items'} for{' '}
                <strong className="text-orange-600 font-semibold">
                  {formatYMDToDisplay(selectedDate)}
                </strong>
              </span>
              <span>
                {selectedProductFilter !== 'ALL' && (
                  <button
                    onClick={() => setSelectedProductFilter('ALL')}
                    className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                  >
                    Clear filter
                  </button>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredRows.map((row, idx) => (
                <ContentCard
                  key={`card-${row.product}-${idx}`}
                  row={row}
                  index={idx}
                  onOpenDrawer={handleOpenDrawer}
                  onCopy={copyToClipboard}
                  copiedKey={copiedKey}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Right Slide-over Content Drawer */}
      <ContentDrawer
        row={selectedDrawerRow}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onCopy={copyToClipboard}
        copiedKey={copiedKey}
      />

      {/* Footer */}
      <footer className="py-7 text-center text-xs text-stone-400 mt-auto">
        <p>
          Content calendar scraper • Single internal tool • Google Sheets read-only sync • Zero
          database
        </p>
      </footer>
    </div>
  );
}
