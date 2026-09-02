'use client';

import React from 'react';
import { Sparkles, Copy, Check, ArrowUpRight, Calendar } from 'lucide-react';
import { ContentRow } from '@/lib/types';
import { generateRowMarkdown } from '@/lib/markdown-template';

interface ContentCardProps {
  row: ContentRow;
  index: number;
  onOpenDrawer: (row: ContentRow) => void;
  onCopy: (text: string, label: string, key: string) => void;
  copiedKey: string | null;
}

export function ContentCard({
  row,
  index,
  onOpenDrawer,
  onCopy,
  copiedKey,
}: ContentCardProps) {
  const cardKey = `card-${row.product}-${index}`;
  const rowMarkdown = generateRowMarkdown(row);
  const displayId = row.documentName || `Post #${index + 1}`;

  const getPlatformStyle = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('linkedin')) return 'bg-sky-50 text-sky-800';
    if (p.includes('instagram')) return 'bg-pink-50 text-pink-800';
    if (p.includes('twitter') || p.includes('x')) return 'bg-stone-100 text-stone-800';
    if (p.includes('youtube') || p.includes('shorts')) return 'bg-red-50 text-red-800';
    return 'bg-purple-50 text-purple-800';
  };

  return (
    <article
      id={`card-${index}`}
      onClick={() => onOpenDrawer(row)}
      className="group bg-white rounded-xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-stone-100 hover:border-stone-200 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3"
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Product Badge */}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-800">
            {row.product}
          </span>

          {/* Platform Badge */}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-md ${getPlatformStyle(
              row.platform
            )}`}
          >
            {row.platform || 'Platform'}
          </span>

          {/* Content Type */}
          {row.contentType && (
            <span className="text-xs font-normal px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
              {row.contentType}
            </span>
          )}

          {/* Content Pillar */}
          {row.contentPillar && (
            <span className="text-xs text-stone-500 hidden sm:inline truncate max-w-[200px]">
              • {row.contentPillar}
            </span>
          )}
        </div>

        {/* Post ID & Open Icon */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono font-medium text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">
            {displayId}
          </span>
          <div className="w-6 h-6 rounded-md bg-stone-100 group-hover:bg-orange-500 group-hover:text-white text-stone-400 flex items-center justify-center transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Post Hook Title */}
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
          {row.postHook || 'Untitled post hook'}
        </h3>
        <p className="text-xs text-stone-500 flex items-center gap-1.5 truncate">
          <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
          <span>{row.date}</span>
          {row.day || row.week ? <span>({[row.week, row.day].filter(Boolean).join(', ')})</span> : null}
          {row.targetAudience ? <span className="hidden md:inline text-stone-400">• {row.targetAudience}</span> : null}
        </p>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 text-xs">
        <span className="text-stone-400 group-hover:text-stone-600 transition-colors font-medium">
          View full scraped details & custom copy →
        </span>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.aiImagePrompt && (
            <button
              type="button"
              id={`quick-copy-prompt-${index}`}
              onClick={() =>
                onCopy(row.aiImagePrompt, 'AI image prompt', `prompt-${cardKey}`)
              }
              className="inline-flex items-center gap-1 bg-orange-50 hover:bg-orange-100 active:scale-[0.98] text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              title="Copy AI image prompt only"
            >
              {copiedKey === `prompt-${cardKey}` ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  <span>Copy prompt</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            id={`quick-copy-markdown-${index}`}
            onClick={() => onCopy(rowMarkdown, 'Post markdown', `md-${cardKey}`)}
            className="inline-flex items-center gap-1 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white text-xs font-semibold px-3 py-1 rounded-lg transition-all cursor-pointer"
            title="Copy full markdown block"
          >
            {copiedKey === `md-${cardKey}` ? (
              <>
                <Check className="w-3 h-3 text-orange-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-orange-400" />
                <span>Copy markdown</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
