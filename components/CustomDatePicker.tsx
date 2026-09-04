'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import {
  getTodayYMD,
  getThisWeekRange,
  getNext7DaysRange,
  getDatesBetween,
  formatDateSelectionDisplay,
} from '@/lib/date-utils';

interface CustomDatePickerProps {
  selectedDates: string[]; // array of YYYY-MM-DD
  onChangeDates: (dates: string[]) => void;
  id?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CustomDatePicker({
  selectedDates,
  onChangeDates,
  id = 'custom-date-picker',
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Range selection temporary state while user is clicking start & end date
  const [rangeStart, setRangeStart] = useState<string | null>(null);

  // Reference date for initial calendar view
  const initialRefDate = useMemo(() => {
    const firstDate = selectedDates[0] || getTodayYMD();
    const [y, m, d] = firstDate.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  }, [selectedDates]);

  // View state for the calendar month and year
  const [viewYear, setViewYear] = useState(initialRefDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialRefDate.getMonth());

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setRangeStart(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setRangeStart(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const ymd = `${year}-${formattedMonth}-${formattedDay}`;

    if (!rangeStart) {
      // First click: select single date and set as potential range start
      setRangeStart(ymd);
      onChangeDates([ymd]);
    } else {
      // Second click: create range between rangeStart and clicked date
      const rangeDates = getDatesBetween(rangeStart, ymd);
      onChangeDates(rangeDates);
      setRangeStart(null);
      setIsOpen(false);
    }
  };

  const handlePresetSelect = (dates: string[]) => {
    onChangeDates(dates);
    setRangeStart(null);
    setIsOpen(false);

    // Sync view year & month to first selected date
    if (dates[0]) {
      const [y, m] = dates[0].split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  };

  const todayStr = getTodayYMD();
  const today = useMemo(() => new Date(), []);
  const isCurrentViewMonthToday =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  // Selected date lookup set
  const selectedDatesSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  // Generate days matrix
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      dayNumber: number;
      month: number;
      year: number;
      ymd: string;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      isRangeEndpoint: boolean;
    }> = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const ymd = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        month: m,
        year: y,
        ymd,
        isCurrentMonth: false,
        isSelected: selectedDatesSet.has(ymd),
        isToday: false,
        isRangeEndpoint: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = selectedDatesSet.has(ymd);
      const isToday = isCurrentViewMonthToday && today.getDate() === d;
      const isRangeEndpoint =
        selectedDates.length > 1 &&
        (selectedDates[0] === ymd || selectedDates[selectedDates.length - 1] === ymd);

      days.push({
        dayNumber: d,
        month: viewMonth,
        year: viewYear,
        ymd,
        isCurrentMonth: true,
        isSelected,
        isToday,
        isRangeEndpoint,
      });
    }

    // Next month filler days (to fill 35 or 42 grid slots)
    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const ymd = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        month: m,
        year: y,
        ymd,
        isCurrentMonth: false,
        isSelected: selectedDatesSet.has(ymd),
        isToday: false,
        isRangeEndpoint: false,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedDates, selectedDatesSet, isCurrentViewMonthToday, today]);

  const displayFormatted = formatDateSelectionDisplay(selectedDates);

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Custom Input Trigger */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white hover:bg-stone-50/80 focus:bg-white text-stone-900 text-xs font-semibold rounded-lg px-3.5 py-2 border border-stone-200/90 focus:border-stone-400 outline-none transition-all flex items-center justify-between gap-2 shadow-2xs cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span className="truncate">{displayFormatted}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-stone-700' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-stone-200 p-4 w-80 animate-in fade-in zoom-in-95 duration-150 space-y-3">
          {/* Quick Presets Bar */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-stone-100">
            <button
              type="button"
              onClick={() => handlePresetSelect([todayStr])}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200/80 text-stone-700 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect(getThisWeekRange(todayStr).dates)}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-800 transition-colors cursor-pointer"
            >
              This week
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect(getNext7DaysRange(todayStr).dates)}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200/80 text-stone-700 transition-colors cursor-pointer"
            >
              Next 7 days
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect(['2026-09-03'])}
              className="px-2.5 py-1 rounded-md text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
            >
              Demo (03 Sep)
            </button>
          </div>

          {/* Month / Year Header Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-stone-900">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mt-2 mb-1">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="text-xs font-bold text-stone-400 tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              const isStart = rangeStart === item.ymd;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleSelectDay(item.year, item.month, item.dayNumber)
                  }
                  className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-xs transition-colors cursor-pointer ${
                    item.isSelected || isStart
                      ? 'bg-orange-500 text-white font-bold shadow-xs'
                      : !item.isCurrentMonth
                      ? 'text-stone-300 hover:text-stone-600 hover:bg-stone-50'
                      : item.isToday
                      ? 'text-orange-600 font-bold bg-orange-50 hover:bg-orange-100'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 font-medium'
                  }`}
                >
                  {item.dayNumber}
                </button>
              );
            })}
          </div>

          {/* Instruction hint */}
          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-400 text-center">
            {rangeStart
              ? 'Click second date to complete range'
              : 'Click once for single date, or click two dates for a range'}
          </div>
        </div>
      )}
    </div>
  );
}
