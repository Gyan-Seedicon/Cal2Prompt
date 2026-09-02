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
 * Maps a normalized header text to a canonical field key.
 */
function mapHeaderToField(cleanHeader: string): CanonicalField | null {
  switch (cleanHeader) {
    case 'week':
      return 'week';
    case 'day':
      return 'day';
    case 'date':
      return 'date';
    case 'platform':
      return 'platform';
    case 'content pillar':
    case 'pillar':
      return 'contentPillar';
    case 'post hook / title':
    case 'post hook/title':
    case 'post hook':
    case 'title':
    case 'hook':
      return 'postHook';
    case 'content intent':
    case 'intent':
      return 'contentIntent';
    case 'target audience':
    case 'audience':
      return 'targetAudience';
    case 'content type':
    case 'type':
      return 'contentType';
    case 'detailed caption':
    case 'caption':
      return 'detailedCaption';
    case 'visual direction':
    case 'visual':
    case 'visuals':
      return 'visualDirection';
    case 'hashtags':
    case 'hashtag':
      return 'hashtags';
    case 'cta':
    case 'call to action':
      return 'cta';
    case 'primary kpi':
    case 'primary kpis':
      return 'primaryKPI';
    case 'secondary kpi':
    case 'secondary kpis':
      return 'secondaryKPI';
    case 'ai image generation prompt':
    case 'ai image prompt':
    case 'image generation prompt':
    case 'image prompt':
      return 'aiImagePrompt';
    case 'document name':
    case 'doc name':
    case 'document':
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
 * filtered by the requested target date (YYYY-MM-DD).
 */
export function parseSheetRows(
  productName: string,
  rawValues: unknown[][],
  targetDateYMD: string
): ParseSheetResult {
  const warnings: string[] = [];

  if (!rawValues || rawValues.length < 2) {
    warnings.push(`[${productName}] Sheet is empty or contains no data rows.`);
    return { rows: [], warnings };
  }

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

    // Check if this row is another header row (e.g. repeated monthly header row like row 30)
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

    // Filter by requested date
    if (rowNormalizedYMD === targetDateYMD) {
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

  return { rows: matchedRows, warnings };
}
