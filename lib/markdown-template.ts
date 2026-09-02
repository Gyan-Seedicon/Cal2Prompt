import { ContentRow } from './types';

export interface MarkdownExportOptions {
  includeHeader: boolean;
  includeMeta: boolean;
  includeHook: boolean;
  includeVisualDirection: boolean;
  includeCaption: boolean;
  includeHashtags: boolean;
  includeCta: boolean;
  includeAiPrompt: boolean;
}

export const DEFAULT_EXPORT_OPTIONS: MarkdownExportOptions = {
  includeHeader: true,
  includeMeta: true,
  includeHook: true,
  includeVisualDirection: true,
  includeCaption: true,
  includeHashtags: true,
  includeCta: true,
  includeAiPrompt: true,
};

/**
 * Generates the exact Markdown format required for a single ContentRow:
 *
 * ## {platform} — {contentPillar}
 * **Product:** {product}
 * **Date:** {date} ({week}, {day})
 * **Content Type:** {contentType}
 * **Post Hook:** {postHook}
 *
 * **Visual Direction:**
 * {visualDirection}
 *
 * **Caption:**
 * {detailedCaption}
 *
 * **Hashtags:** {hashtags}
 * **CTA:** {cta}
 *
 * ### AI Image Generation Prompt
 * {aiImagePrompt}
 */
export function generateRowMarkdown(row: ContentRow): string {
  const platform = row.platform || 'General';
  const contentPillar = row.contentPillar || 'Brand';
  const product = row.product || 'Unknown product';
  const date = row.date || '';
  const week = row.week || '';
  const day = row.day || '';
  const contentType = row.contentType || '';
  const postHook = row.postHook || '';
  const visualDirection = row.visualDirection || '';
  const detailedCaption = row.detailedCaption || '';
  const hashtags = row.hashtags || '';
  const cta = row.cta || '';
  const aiImagePrompt = row.aiImagePrompt || '';

  return `## ${platform} — ${contentPillar}
**Product:** ${product}
**Date:** ${date} (${week}, ${day})
**Content Type:** ${contentType}
**Post Hook:** ${postHook}

**Visual Direction:**
${visualDirection}

**Caption:**
${detailedCaption}

**Hashtags:** ${hashtags}
**CTA:** ${cta}

### AI Image Generation Prompt
${aiImagePrompt}`;
}

/**
 * Generates customizable Markdown based on the user's selected checkboxes.
 */
export function generateCustomMarkdown(
  row: ContentRow,
  options: MarkdownExportOptions = DEFAULT_EXPORT_OPTIONS
): string {
  const sections: string[] = [];

  if (options.includeHeader && (row.platform || row.contentPillar)) {
    sections.push(`## ${row.platform || 'General'} — ${row.contentPillar || 'Brand'}`);
  }

  const metaLines: string[] = [];
  if (options.includeMeta) {
    if (row.product) metaLines.push(`**Product:** ${row.product}`);
    if (row.date) {
      const parts = [row.week, row.day].filter(Boolean).join(', ');
      metaLines.push(`**Date:** ${row.date}${parts ? ` (${parts})` : ''}`);
    }
  }

  if (options.includeHook) {
    if (row.contentType) metaLines.push(`**Content Type:** ${row.contentType}`);
    if (row.postHook) metaLines.push(`**Post Hook:** ${row.postHook}`);
  }

  if (metaLines.length > 0) {
    sections.push(metaLines.join('\n'));
  }

  if (options.includeVisualDirection && row.visualDirection) {
    sections.push(`**Visual Direction:**\n${row.visualDirection}`);
  }

  if (options.includeCaption && row.detailedCaption) {
    sections.push(`**Caption:**\n${row.detailedCaption}`);
  }

  const tagLines: string[] = [];
  if (options.includeHashtags && row.hashtags) {
    tagLines.push(`**Hashtags:** ${row.hashtags}`);
  }
  if (options.includeCta && row.cta) {
    tagLines.push(`**CTA:** ${row.cta}`);
  }
  if (tagLines.length > 0) {
    sections.push(tagLines.join('\n'));
  }

  if (options.includeAiPrompt && row.aiImagePrompt) {
    sections.push(`### AI Image Generation Prompt\n${row.aiImagePrompt}`);
  }

  return sections.join('\n\n');
}

/**
 * Combines multiple row Markdown blocks separated by "---".
 */
export function generateAllMarkdown(rows: ContentRow[]): string {
  return rows.map((row) => generateRowMarkdown(row)).join('\n\n---\n\n');
}
