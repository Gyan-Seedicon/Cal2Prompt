import { NextRequest, NextResponse } from 'next/server';
import { normalizeDateToYMD, getDatesBetween } from '@/lib/date-utils';
import { fetchCalendarRowsForDate } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawDate = searchParams.get('date');
    const rawDates = searchParams.get('dates');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const targetDates: string[] = [];

    // Case 1: Date range (startDate + endDate)
    if (startDate && endDate) {
      const normStart = normalizeDateToYMD(startDate);
      const normEnd = normalizeDateToYMD(endDate);
      if (normStart && normEnd) {
        targetDates.push(...getDatesBetween(normStart, normEnd));
      }
    }

    // Case 2: Comma-separated dates
    if (rawDates) {
      const splitDates = rawDates.split(',');
      for (const d of splitDates) {
        const norm = normalizeDateToYMD(d.trim());
        if (norm && !targetDates.includes(norm)) {
          targetDates.push(norm);
        }
      }
    }

    // Case 3: Single date
    if (rawDate && targetDates.length === 0) {
      const norm = normalizeDateToYMD(rawDate.trim());
      if (norm) {
        targetDates.push(norm);
      }
    }

    if (targetDates.length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "date", "dates", or "startDate" & "endDate" is required (e.g. date=2026-09-03).' },
        { status: 400 }
      );
    }

    const result = await fetchCalendarRowsForDate(targetDates);

    // If no rows match any tab, return an empty array (not an error)
    return NextResponse.json(result.rows, {
      status: 200,
      headers: {
        'x-data-source': result.source,
        'x-matched-count': String(result.rows.length),
        'x-target-dates': targetDates.join(','),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[API /api/calendar] Unhandled error:', message);

    return NextResponse.json(
      { error: 'An internal error occurred while reading calendar sheets.', details: message },
      { status: 500 }
    );
  }
}
