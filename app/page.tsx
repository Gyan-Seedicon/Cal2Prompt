'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { ContentRow } from '@/lib/types';
import {
  getTodayYMD,
  getThisWeekRange,
  formatDateSelectionDisplay,
} from '@/lib/date-utils';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { ContentCard } from '@/components/ContentCard';
import { ContentDrawer } from '@/components/ContentDrawer';
import { Toast } from '@/components/Toast';

const STORAGE_KEY = 'cal2prompt_done_posts';

export default function CalendarScraperPage() {
  // Initialize with today's date by default
  const [selectedDates, setSelectedDates] = useState<string[]>([getTodayYMD()]);
  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & UI states
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent Todo / Done Map: { [postKey]: boolean }
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  // Drawer state for selected card
  const [selectedDrawerRow, setSelectedDrawerRow] = useState<ContentRow | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Load persistent todo state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          setCompletedMap(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read todo state from localStorage:', e);
    }
  }, []);

  // Generate a stable unique key for a post
  const getPostKey = (row: ContentRow): string => {
    return `${row.product}__${row.documentName || ''}__${row.date}__${row.platform}__${(row.postHook || '').slice(0, 30)}`;
  };

  // Toggle todo / done state and persist to localStorage
  const handleToggleDone = (row: ContentRow) => {
    const key = getPostKey(row);
    setCompletedMap((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save todo state to localStorage:', e);
      }
      return updated;
    });

    const willBeDone = !completedMap[key];
    showToast(willBeDone ? 'Post marked as completed!' : 'Post marked as pending');
  };

  // Clear all completed posts
  const handleClearCompleted = () => {
    setCompletedMap({});
    try {
      localStorage.removeItem(STORAGE_KEY);
      showToast('Completed status reset');
    } catch (e) {
      console.warn('Could not reset todo state in localStorage:', e);
    }
  };

  // Trigger initial fetch for today's date automatically on landing
  useEffect(() => {
    const today = getTodayYMD();
    fetchContentForDates([today]);
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

  const fetchContentForDates = async (datesToFetch: string[]) => {
    if (!datesToFetch || datesToFetch.length === 0) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const datesParam = datesToFetch.join(',');
      const res = await fetch(`/api/calendar?dates=${encodeURIComponent(datesParam)}`);

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

  const handleSelectPresetDates = (dates: string[]) => {
    setSelectedDates(dates);
    fetchContentForDates(dates);
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

  // Count completed posts in current result set
  const completedCount = useMemo(() => {
    return rows.filter((r) => completedMap[getPostKey(r)]).length;
  }, [rows, completedMap]);

  const handleOpenDrawer = (row: ContentRow) => {
    setSelectedDrawerRow(row);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const dateDisplayLabel = formatDateSelectionDisplay(selectedDates);

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-stone-800 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-950">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Header */}
      <Header
        selectedDates={selectedDates}
        onSelectDates={handleSelectPresetDates}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-7">
        {/* Surface Search & Filter Bar */}
        <SearchBar
          selectedDates={selectedDates}
          onChangeDates={handleSelectPresetDates}
          onSubmit={() => fetchContentForDates(selectedDates)}
          loading={loading}
          totalRows={rows.length}
          productNames={allProductNames}
          productCounts={productCounts}
          selectedFilter={selectedProductFilter}
          onSelectFilter={setSelectedProductFilter}
          completedCount={completedCount}
          onClearCompleted={handleClearCompleted}
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
            <div className="h-4 w-44 bg-stone-200/70 rounded-md animate-pulse" />
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl p-5 space-y-3 shadow-xs border border-stone-200/70 animate-pulse"
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
          <div className="bg-white rounded-xl p-10 text-center max-w-lg mx-auto shadow-xs border border-stone-200/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto text-orange-500 shadow-xs border border-orange-100">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-stone-900" id="empty-state-text">
              No content scheduled for {dateDisplayLabel}
            </h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              No matching rows were found across the 4 configured spreadsheets for this date selection.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSelectPresetDates(getThisWeekRange().dates)}
                className="text-xs text-stone-700 bg-stone-100 hover:bg-stone-200/80 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Search This Week
              </button>
              <button
                type="button"
                onClick={() => handleSelectPresetDates(['2026-09-03'])}
                className="text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Try 03 Sep 2026 (demo) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && filteredRows.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 px-1">
              <span>
                Displaying{' '}
                <strong className="text-stone-900 font-bold">{filteredRows.length}</strong> content{' '}
                {filteredRows.length === 1 ? 'item' : 'items'} for{' '}
                <strong className="text-orange-600 font-bold">
                  {dateDisplayLabel}
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
              {filteredRows.map((row, idx) => {
                const postKey = getPostKey(row);
                const isDone = Boolean(completedMap[postKey]);

                return (
                  <ContentCard
                    key={`card-${row.product}-${row.date}-${idx}`}
                    row={row}
                    index={idx}
                    onOpenDrawer={handleOpenDrawer}
                    onCopy={copyToClipboard}
                    copiedKey={copiedKey}
                    isDone={isDone}
                    onToggleDone={handleToggleDone}
                  />
                );
              })}
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
        isDone={selectedDrawerRow ? Boolean(completedMap[getPostKey(selectedDrawerRow)]) : false}
        onToggleDone={handleToggleDone}
      />

      {/* Footer */}
      <footer className="py-7 text-center text-xs text-stone-400 mt-auto border-t border-stone-100">
        <p>
          Cal2Prompt • Google Sheets real-time synchronization • Allbuddy · Deckwale · FWC · Seedicon
        </p>
      </footer>
    </div>
  );
}
