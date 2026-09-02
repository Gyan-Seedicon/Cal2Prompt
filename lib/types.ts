export interface ContentRow {
  product: string;
  week: string;
  day: string;
  date: string;
  platform: string;
  contentPillar: string;
  postHook: string;
  contentIntent: string;
  targetAudience: string;
  contentType: string;
  detailedCaption: string;
  visualDirection: string;
  hashtags: string;
  cta: string;
  primaryKPI: string;
  secondaryKPI: string;
  aiImagePrompt: string;
  documentName: string;
}

export interface ProductSheetConfig {
  productName: string;
  spreadsheetId: string;
  tabName?: string;
}

export interface CalendarApiResponse {
  success: boolean;
  source: 'mock' | 'live';
  date: string;
  totalMatches: number;
  data: ContentRow[];
  warnings?: string[];
  error?: string;
}
