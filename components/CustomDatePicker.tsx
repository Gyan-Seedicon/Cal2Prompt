'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { formatYMDToDisplay } from '@/lib/date-utils';

interface CustomDatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
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

export function CustomDatePicker({ value, onChange, id }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to current date
  const selectedDateObj = React.useMemo(() => {
    if (!value) return new Date();
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  }, [value]);

  // View state for the calendar month and year
  const [viewYear, setViewYear] = useState(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDateObj.getMonth());

  // Sync view when external value changes
  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      if (y && m) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [value]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
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
    onChange(ymd);
    setIsOpen(false);
  };

  // Generate days matrix
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      dayNumber: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        dayNumber: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
      });
    }

    // Current month days
    const today = new Date();
    const isCurrentViewMonthToday =
      today.getFullYear() === viewYear && today.getMonth() === viewMonth;

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const isSelected =
        selectedDateObj.getFullYear() === viewYear &&
        selectedDateObj.getMonth() === viewMonth &&
        selectedDateObj.getDate() === d;

      const isToday = isCurrentViewMonthToday && today.getDate() === d;

      days.push({
        dayNumber: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        isSelected,
        isToday,
      });
    }

    // Next month filler days (to fill 35 or 42 grid slots)
    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        dayNumber: i,
        month: m,
        year: y,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedDateObj]);

  const displayFormatted = value ? formatYMDToDisplay(value) : 'Select date';
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Custom Input Trigger */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-stone-50 hover:bg-stone-100/80 focus:bg-white text-stone-900 text-xs font-semibold rounded-lg px-3 py-2 border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all flex items-center justify-between gap-2 shadow-xs cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="truncate">{displayFormatted}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-orange-500' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-stone-200 p-3.5 w-72 animate-in fade-in zoom-in-95 duration-150">
          {/* Month / Year Header Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
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
              className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mt-2.5 mb-1.5">
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
              if (item.isSelected) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      handleSelectDay(item.year, item.month, item.dayNumber)
                    }
                    className="h-7 w-7 mx-auto flex items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    {item.dayNumber}
                  </button>
                );
              }

              if (!item.isCurrentMonth) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      handleSelectDay(item.year, item.month, item.dayNumber)
                    }
                    className="h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-stone-300 hover:text-stone-600 hover:bg-stone-50 text-xs transition-colors cursor-pointer"
                  >
                    {item.dayNumber}
                  </button>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleSelectDay(item.year, item.month, item.dayNumber)
                  }
                  className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    item.isToday
                      ? 'text-orange-600 font-bold bg-orange-50 hover:bg-orange-100'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {item.dayNumber}
                </button>
              );
            })}
          </div>

          {/* Calendar Quick Shortcuts Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-xs">
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('2026-09-03');
                setIsOpen(false);
              }}
              className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
            >
              03 Sep 2026 (demo)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
