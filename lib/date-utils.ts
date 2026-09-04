/**
 * Robust date normalization utilities for Google Sheet date columns.
 * Supports variants like:
 * - "03 Sep 2026", "3 Sep 2026", "03-Sep-2026", "3rd Sep 2026", "Sat 15 Aug 2026"
 * - "September 3, 2026", "Sep 3, 2026"
 * - "2026-09-03", "2026/09/03", "2026.09.03"
 * - "09/03/2026", "03/09/2026"
 * - Google Sheets serial date numbers (e.g. 46268)
 * - ISO date strings
 */

const MONTH_MAP: Record<string, string> = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', sept: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12',
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Returns today's date in local 'YYYY-MM-DD' format.
 */
export function getTodayYMD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Normalizes any recognized date representation to 'YYYY-MM-DD'.
 * Returns null if the value cannot be parsed as a valid date.
 */
export function normalizeDateToYMD(rawDate: unknown): string | null {
  if (rawDate === null || rawDate === undefined) return null;

  // Handle number (Google Sheet serial number)
  if (typeof rawDate === 'number' && !isNaN(rawDate)) {
    return parseSerialDate(rawDate);
  }

  const str = String(rawDate).trim();
  if (!str) return null;

  // Check if string is purely numeric (serial number in string form)
  if (/^\d{5}(\.\d+)?$/.test(str)) {
    return parseSerialDate(parseFloat(str));
  }

  // Check for ISO or standard YYYY-MM-DD / YYYY/MM/DD / YYYY.MM.DD
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Clean string: remove day-of-week prefixes, ordinal suffixes (1st, 2nd, 3rd, 4th...), commas, dots
  const cleaned = str
    .replace(/^(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[,\.\s]+/gi, '')
    .replace(/(\d+)(st|nd|rd|th)/gi, '$1')
    .replace(/[,\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Pattern: "03 Sep 2026", "3 September 2026", "03-Sep-2026"
  const dayMonthYearRegex = /^(\d{1,2})[-\s/]+([a-zA-Z]+)[-\s/]+(\d{2,4})$/;
  const dmyMatch = cleaned.match(dayMonthYearRegex);
  if (dmyMatch) {
    const [, dayStr, monthStr, yearStr] = dmyMatch;
    const monthKey = monthStr.toLowerCase();
    const month = MONTH_MAP[monthKey];
    if (month) {
      const year = expandYear(yearStr);
      const day = dayStr.padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // Pattern: "September 03 2026", "Sep 3 2026"
  const monthDayYearRegex = /^([a-zA-Z]+)[-\s/]+(\d{1,2})[-\s/]+(\d{2,4})$/;
  const mdyMatch = cleaned.match(monthDayYearRegex);
  if (mdyMatch) {
    const [, monthStr, dayStr, yearStr] = mdyMatch;
    const monthKey = monthStr.toLowerCase();
    const month = MONTH_MAP[monthKey];
    if (month) {
      const year = expandYear(yearStr);
      const day = dayStr.padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // Pattern: "09/03/2026" or "03/09/2026"
  const slashMatch = str.match(/^(\d{1,2})[/](\d{1,2})[/](\d{2,4})$/);
  if (slashMatch) {
    const [, p1, p2, p3] = slashMatch;
    const year = expandYear(p3);
    const n1 = parseInt(p1, 10);
    const n2 = parseInt(p2, 10);

    // If first number > 12, it must be DD/MM/YYYY
    if (n1 > 12 && n2 <= 12) {
      return `${year}-${String(n2).padStart(2, '0')}-${String(n1).padStart(2, '0')}`;
    }
    // Default to MM/DD/YYYY standard unless n2 > 12
    if (n2 > 12 && n1 <= 12) {
      return `${year}-${String(n1).padStart(2, '0')}-${String(n2).padStart(2, '0')}`;
    }
    // Ambiguous: assume standard ISO/US MM/DD/YYYY
    return `${year}-${String(n1).padStart(2, '0')}-${String(n2).padStart(2, '0')}`;
  }

  // Fallback: standard Javascript Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return null;
}

/**
 * Parses Google Sheets / Excel serial date (days since Dec 30 1899)
 */
function parseSerialDate(serial: number): string | null {
  // Excel epoch: Dec 30, 1899
  const msPerDay = 86400000;
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(epoch.getTime() + Math.round(serial) * msPerDay);
  if (isNaN(date.getTime())) return null;

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function expandYear(y: string): string {
  if (y.length === 2) {
    const num = parseInt(y, 10);
    return num >= 70 ? `19${y}` : `20${y}`;
  }
  return y;
}

/**
 * Formats YYYY-MM-DD into human-friendly "03 Sep 2026"
 */
export function formatYMDToDisplay(ymd: string): string {
  if (!ymd) return '';
  const parts = ymd.split('-');
  if (parts.length !== 3) return ymd;
  const [y, m, d] = parts;
  const monthIndex = parseInt(m, 10) - 1;
  const monthName = MONTH_NAMES[monthIndex] || m;
  return `${d.padStart(2, '0')} ${monthName} ${y}`;
}

/**
 * Generates an array of all dates (YYYY-MM-DD) between startYMD and endYMD inclusive.
 */
export function getDatesBetween(startYMD: string, endYMD: string): string[] {
  if (!startYMD) return [];
  if (!endYMD || startYMD === endYMD) return [startYMD];

  const [y1, m1, d1] = startYMD.split('-').map(Number);
  const [y2, m2, d2] = endYMD.split('-').map(Number);

  const start = new Date(y1, m1 - 1, d1);
  const end = new Date(y2, m2 - 1, d2);

  // If start is after end, swap them
  const [fromDate, toDate] = start <= end ? [start, end] : [end, start];

  const dates: string[] = [];
  const current = new Date(fromDate);

  // Safety cap at 60 days
  let count = 0;
  while (current <= toDate && count < 60) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
    count++;
  }

  return dates;
}

/**
 * Gets "This Week" (Monday to Sunday) date range around the given date or current date.
 */
export function getThisWeekRange(referenceDateYMD?: string): { start: string; end: string; dates: string[] } {
  const ref = referenceDateYMD ? new Date(referenceDateYMD + 'T00:00:00') : new Date();
  const dayOfWeek = ref.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(ref);
  monday.setDate(ref.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const start = format(monday);
  const end = format(sunday);
  return {
    start,
    end,
    dates: getDatesBetween(start, end),
  };
}

/**
 * Gets "Next 7 Days" date range starting from the given date or current date.
 */
export function getNext7DaysRange(referenceDateYMD?: string): { start: string; end: string; dates: string[] } {
  const ref = referenceDateYMD ? new Date(referenceDateYMD + 'T00:00:00') : new Date();
  const next7 = new Date(ref);
  next7.setDate(ref.getDate() + 6);

  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const start = format(ref);
  const end = format(next7);
  return {
    start,
    end,
    dates: getDatesBetween(start, end),
  };
}

/**
 * Formats a list or range of dates for clean UI display.
 */
export function formatDateSelectionDisplay(dates: string[]): string {
  if (!dates || dates.length === 0) return 'Select date';
  if (dates.length === 1) return formatYMDToDisplay(dates[0]);

  // If contiguous range
  const sorted = [...dates].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const isContiguous = getDatesBetween(first, last).length === sorted.length;
  if (isContiguous) {
    const [y1, m1, d1] = first.split('-');
    const [y2, m2, d2] = last.split('-');

    if (y1 === y2 && m1 === m2) {
      const monthName = MONTH_NAMES[parseInt(m1, 10) - 1];
      return `${d1.padStart(2, '0')} – ${d2.padStart(2, '0')} ${monthName} ${y1} (${dates.length} days)`;
    }
    return `${formatYMDToDisplay(first)} – ${formatYMDToDisplay(last)} (${dates.length} days)`;
  }

  return `${formatYMDToDisplay(first)} + ${dates.length - 1} more (${dates.length} dates)`;
}
