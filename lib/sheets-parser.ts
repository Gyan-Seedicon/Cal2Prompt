import { ContentRow } from './types';
import { normalizeDateToYMD } from './date-utils';

type CanonicalField = keyof Omit<ContentRow, 'product'>;

/**
 * Normalizes header string by trimming, lowercasing, and replacing multiple spaces with single space.
 */
function normalizeHeaderName(header: string): string {
  return (header || '')
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, ' ')
    .replace(/\s*\/\s*/g, ' / ');
}

/**
 * Maps a normalized header text to a canonical field key case-insensitively and flexibly.
 */
function mapHeaderToField(cleanHeader: string): CanonicalField | null {
  switch (cleanHeader) {
    case 'week':
    case 'weeks':
      return 'week';

    case 'day':
    case 'day of week':
    case 'posting day':
      return 'day';

    case 'date':
    case 'planned posting date':
    case 'posting date':
    case 'publish date':
    case 'scheduled date':
      return 'date';

    case 'platform':
    case 'channels':
    case 'channel':
      return 'platform';

    case 'content pillar':
    case 'pillar':
    case 'theme':
    case 'content theme':
      return 'contentPillar';

    case 'post hook / title':
    case 'post hook/title':
    case 'hook / title':
    case 'hook/title':
    case 'post hook':
    case 'hook':
    case 'post title':
    case 'title':
    case 'headline':
    case 'main hook':
      return 'postHook';

    case 'content intent':
    case 'intent':
    case 'post intent':
    case 'objective':
    case 'goal':
      return 'contentIntent';

    case 'target audience':
    case 'audience':
    case 'persona':
      return 'targetAudience';

    case 'content type':
    case 'type':
    case 'post type':
    case 'format':
      return 'contentType';

    case 'detailed caption / copy':
    case 'detailed caption/copy':
    case 'caption / copy':
    case 'caption/copy':
    case 'detailed caption':
    case 'caption':
    case 'post copy':
    case 'copy':
    case 'post content':
    case 'content':
      return 'detailedCaption';

    case 'visual direction':
    case 'visuals':
    case 'visual':
    case 'creative direction':
    case 'design direction':
    case 'image idea':
      return 'visualDirection';

    case 'hashtags':
    case 'hashtag':
    case 'tags':
      return 'hashtags';

    case 'cta':
    case 'call to action':
    case 'call-to-action':
      return 'cta';

    case 'primary kpi':
    case 'primary kpis':
    case 'primary metric':
    case 'kpi':
    case 'kpis':
      return 'primaryKPI';

    case 'secondary kpi':
    case 'secondary kpis':
    case 'secondary metric':
      return 'secondaryKPI';

    case 'ai image generation prompt':
    case 'ai image prompt':
    case 'image generation prompt':
    case 'image prompt':
    case 'ai prompt':
    case 'visual prompt':
    case 'midjourney prompt':
    case 'prompt':
      return 'aiImagePrompt';

    case 'document name':
    case 'doc name':
    case 'document':
    case 'doc code':
    case 'document code':
    case 'post id':
    case 'id':
      return 'documentName';

    default:
      return null;
  }
}

export interface ParseSheetResult {
  rows: ContentRow[];
  warnings: string[];
}

/**
 * Parses raw 2D array of rows from Google Sheets into structured ContentRow objects,
 * filtered by the requested target date(s) (YYYY-MM-DD).
 */
export function parseSheetRows(
  productName: string,
  rawValues: unknown[][],
  targetDateYMD: string | string[]
): ParseSheetResult {
  const warnings: string[] = [];

  if (!rawValues || rawValues.length < 2) {
    warnings.push(`[${productName}] Sheet is empty or contains no data rows.`);
    return { rows: [], warnings };
  }

  // Build target date set
  const targetDateSet = new Set(
    Array.isArray(targetDateYMD)
      ? targetDateYMD.map((d) => d.trim()).filter(Boolean)
      : String(targetDateYMD).split(',').map((d) => d.trim()).filter(Boolean)
  );

  // Find the header row (check first 10 rows for the row containing 'date')
  let headerRowIndex = -1;
  let fieldIndexMap: Partial<Record<CanonicalField, number>> = {};

  for (let r = 0; r < Math.min(rawValues.length, 10); r++) {
    const candidateHeaders = rawValues[r] as string[];
    if (!candidateHeaders || !Array.isArray(candidateHeaders)) continue;

    const tempMap: Partial<Record<CanonicalField, number>> = {};
    candidateHeaders.forEach((rawH, colIdx) => {
      if (typeof rawH === 'string' && rawH.trim()) {
        const clean = normalizeHeaderName(rawH);
        const field = mapHeaderToField(clean);
        if (field && tempMap[field] === undefined) {
          tempMap[field] = colIdx;
        }
      }
    });

    if (tempMap.date !== undefined && (tempMap.platform !== undefined || tempMap.postHook !== undefined)) {
      headerRowIndex = r;
      fieldIndexMap = tempMap;
      break;
    }
  }

  // If no combination found, fallback to checking row 0 for date
  if (headerRowIndex === -1) {
    const rawHeaders = rawValues[0] as string[];
    rawHeaders.forEach((rawH, colIdx) => {
      if (typeof rawH === 'string' && rawH.trim()) {
        const clean = normalizeHeaderName(rawH);
        const field = mapHeaderToField(clean);
        if (field && fieldIndexMap[field] === undefined) {
          fieldIndexMap[field] = colIdx;
        }
      }
    });
    if (fieldIndexMap.date !== undefined) {
      headerRowIndex = 0;
    }
  }

  if (headerRowIndex === -1 || fieldIndexMap.date === undefined) {
    const warn = `[${productName}] Missing "Date" column header in sheet.`;
    console.warn(warn);
    warnings.push(warn);
    return { rows: [], warnings };
  }

  const matchedRows: ContentRow[] = [];

  for (let r = headerRowIndex + 1; r < rawValues.length; r++) {
    const rowValues = rawValues[r];
    if (!rowValues || rowValues.length === 0) continue;

    // Check if entire row is empty
    const isRowEmpty = rowValues.every((val) => val === undefined || val === null || String(val).trim() === '');
    if (isRowEmpty) continue;

    const rawDateVal = rowValues[fieldIndexMap.date];
    if (!rawDateVal) continue;

    // Check if this row is another header row (e.g. repeated monthly header row like row 13 or row 30)
    if (String(rawDateVal).trim().toLowerCase() === 'date') {
      rowValues.forEach((rawH, colIdx) => {
        if (typeof rawH === 'string' && rawH.trim()) {
          const clean = normalizeHeaderName(rawH);
          const field = mapHeaderToField(clean);
          if (field) {
            fieldIndexMap[field] = colIdx;
          }
        }
      });
      continue;
    }

    const rowNormalizedYMD = normalizeDateToYMD(rawDateVal);
    if (!rowNormalizedYMD) {
      // Date column not parseable
      continue;
    }

    // Filter by requested date(s)
    if (targetDateSet.has(rowNormalizedYMD)) {
      const getVal = (field: CanonicalField): string => {
        const idx = fieldIndexMap[field];
        if (idx === undefined || idx >= rowValues.length) return '';
        const val = rowValues[idx];
        return val !== undefined && val !== null ? String(val).trim() : '';
      };

      const contentRow: ContentRow = {
        product: productName,
        week: getVal('week'),
        day: getVal('day'),
        date: getVal('date') || String(rawDateVal),
        platform: getVal('platform'),
        contentPillar: getVal('contentPillar'),
        postHook: getVal('postHook'),
        contentIntent: getVal('contentIntent'),
        targetAudience: getVal('targetAudience'),
        contentType: getVal('contentType'),
        detailedCaption: getVal('detailedCaption'),
        visualDirection: getVal('visualDirection'),
        hashtags: getVal('hashtags'),
        cta: getVal('cta'),
        primaryKPI: getVal('primaryKPI'),
        secondaryKPI: getVal('secondaryKPI'),
        aiImagePrompt: getVal('aiImagePrompt'),
        documentName: getVal('documentName'),
      };

      matchedRows.push(contentRow);
    }
  }

  // Sort matched rows chronologically by date ascending, then product name
  matchedRows.sort((a, b) => {
    const ymdA = normalizeDateToYMD(a.date) || '';
    const ymdB = normalizeDateToYMD(b.date) || '';
    if (ymdA !== ymdB) return ymdA.localeCompare(ymdB);
    return a.product.localeCompare(b.product);
  });

  return { rows: matchedRows, warnings };
}
