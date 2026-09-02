import { google } from 'googleapis';
import { ContentRow, ProductSheetConfig } from './types';
import { parseSheetRows } from './sheets-parser';

/**
 * Resolves configuration for products and their Google Spreadsheets.
 * Supports:
 * 1. GOOGLE_SHEETS_CONFIG: JSON string of ProductSheetConfig[]
 *    e.g. [{"productName":"Product A","spreadsheetId":"xxx","tabName":"Sheet1"}, ...]
 * 2. Individual env vars: GOOGLE_SHEET_PRODUCT_1_NAME, GOOGLE_SHEET_PRODUCT_1_ID, etc.
 * 3. Single spreadsheet with multi-tabs: GOOGLE_SHEET_ID + GOOGLE_SHEET_TABS (comma-separated)
 */
export function resolveSheetsConfig(): ProductSheetConfig[] {
  // Option 1: GOOGLE_SHEETS_CONFIG JSON
  const jsonConfigStr = process.env.GOOGLE_SHEETS_CONFIG;
  if (jsonConfigStr && jsonConfigStr.trim()) {
    try {
      const parsed = JSON.parse(jsonConfigStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          productName: item.productName || item.product || 'Unnamed Product',
          spreadsheetId: item.spreadsheetId || item.sheetId || '',
          tabName: item.tabName || item.tab || undefined,
        }));
      }
    } catch (e) {
      console.error('[GoogleSheets] Failed to parse GOOGLE_SHEETS_CONFIG JSON:', e);
    }
  }

  // Option 2: Individual variables (1 to 4 or more)
  const configs: ProductSheetConfig[] = [];
  for (let i = 1; i <= 10; i++) {
    const name = process.env[`GOOGLE_SHEET_PRODUCT_${i}_NAME`];
    const id = process.env[`GOOGLE_SHEET_PRODUCT_${i}_ID`];
    const tab = process.env[`GOOGLE_SHEET_PRODUCT_${i}_TAB`];
    if (name && id) {
      configs.push({
        productName: name.trim(),
        spreadsheetId: id.trim(),
        tabName: tab ? tab.trim() : undefined,
      });
    }
  }
  if (configs.length > 0) {
    return configs;
  }

  // Option 3: Single spreadsheet with multiple tabs (Product A, Product B, Product C, Product D)
  const singleSheetId = process.env.GOOGLE_SHEET_ID;
  const sheetTabs = process.env.GOOGLE_SHEET_TABS;
  if (singleSheetId && sheetTabs) {
    const tabs = sheetTabs.split(',').map((t) => t.trim()).filter(Boolean);
    return tabs.map((tab) => ({
      productName: tab,
      spreadsheetId: singleSheetId.trim(),
      tabName: tab,
    }));
  }

  return [];
}

/**
 * Checks if live Google credentials and sheet configs are properly available.
 */
export function isGoogleSheetsConfigured(): boolean {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const configs = resolveSheetsConfig();

  return Boolean(
    email &&
    email.trim() &&
    !email.includes('example.com') &&
    privateKey &&
    privateKey.trim() &&
    !privateKey.includes('PLACEHOLDER') &&
    configs.length > 0 &&
    configs.some((c) => c.spreadsheetId && !c.spreadsheetId.includes('PLACEHOLDER'))
  );
}

/**
 * Retrieves Google Sheets client using Google Service Account JWT.
 */
function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  let privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim() || '';

  // Handle newline escaping in environment variable
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

export interface FetchCalendarResult {
  source: 'live';
  rows: ContentRow[];
  warnings: string[];
}

/**
 * Fetches content rows matching targetDateYMD across all configured products/spreadsheets in real time.
 */
export async function fetchCalendarRowsForDate(targetDateYMD: string): Promise<FetchCalendarResult> {
  if (!isGoogleSheetsConfigured()) {
    throw new Error(
      'Google Sheets is not configured. Please provide GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEETS_CONFIG in .env.local.'
    );
  }

  // Live Google Sheets mode
  const configs = resolveSheetsConfig();
  const sheets = getSheetsClient();
  const allRows: ContentRow[] = [];
  const warnings: string[] = [];

  // Query all sheets concurrently with Promise.allSettled
  const results = await Promise.allSettled(
    configs.map(async (config) => {
      let resolvedTabName = config.tabName;

      // Fetch spreadsheet metadata to discover exact tab names & handle case/whitespace differences
      try {
        const meta = await sheets.spreadsheets.get({
          spreadsheetId: config.spreadsheetId,
          fields: 'sheets.properties',
        });
        const sheetList = meta.data.sheets || [];
        if (sheetList.length > 0) {
          if (config.tabName) {
            const cleanTarget = config.tabName.trim().toLowerCase();
            const matchedSheet = sheetList.find(
              (s) => s.properties?.title?.trim().toLowerCase() === cleanTarget
            );
            if (matchedSheet?.properties?.title) {
              resolvedTabName = matchedSheet.properties.title || undefined;
            } else {
              // Fallback to first sheet if specified tab name isn't found
              resolvedTabName = (sheetList[0]?.properties?.title || config.tabName) || undefined;
            }
          } else {
            // Default to first sheet
            resolvedTabName = sheetList[0]?.properties?.title || undefined;
          }
        }
      } catch (metaErr) {
        console.warn(`[GoogleSheets] Could not fetch metadata for ${config.productName}, using provided tab name:`, metaErr);
      }

      const cleanTabName = resolvedTabName ? resolvedTabName.replace(/'/g, "\\'") : '';
      const range = cleanTabName ? `'${cleanTabName}'!A1:ZZ` : 'A1:ZZ';
      console.log(`[GoogleSheets] Fetching ${config.productName} from spreadsheet ${config.spreadsheetId} range ${range}`);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range,
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING',
      });

      const rawValues = (response.data.values as unknown[][]) || [];
      return parseSheetRows(config.productName, rawValues, targetDateYMD);
    })
  );

  results.forEach((result, idx) => {
    const config = configs[idx];
    if (result.status === 'fulfilled') {
      allRows.push(...result.value.rows);
      warnings.push(...result.value.warnings);
    } else {
      const errorMsg = `[${config.productName}] Error reading spreadsheet ${config.spreadsheetId}: ${result.reason?.message || result.reason}`;
      console.warn(errorMsg);
      warnings.push(errorMsg);
    }
  });

  return {
    source: 'live',
    rows: allRows,
    warnings,
  };
}
