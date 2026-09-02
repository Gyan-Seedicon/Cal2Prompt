import { NextRequest, NextResponse } from 'next/server';
import { normalizeDateToYMD } from '@/lib/date-utils';
import { fetchCalendarRowsForDate } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawDate = searchParams.get('date');

    if (!rawDate) {
      return NextResponse.json(
        { error: 'Query parameter "date" is required (format: YYYY-MM-DD or e.g. 03 Sep 2026).' },
        { status: 400 }
      );
    }

    const normalizedDate = normalizeDateToYMD(rawDate);
    if (!normalizedDate) {
      return NextResponse.json(
        { error: `Invalid date format: "${rawDate}". Please provide a valid date like 2026-09-03 or "03 Sep 2026".` },
        { status: 400 }
      );
    }

    const result = await fetchCalendarRowsForDate(normalizedDate);

    // If no rows match any tab, return an empty array (not an error)
    return NextResponse.json(result.rows, {
      status: 200,
      headers: {
        'x-data-source': result.source,
        'x-matched-count': String(result.rows.length),
        'x-normalized-date': normalizedDate,
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
