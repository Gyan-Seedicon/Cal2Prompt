'use client';

import React from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { ContentRow } from '@/lib/types';
import { generateRowMarkdown } from '@/lib/markdown-template';

interface ContentCardProps {
  row: ContentRow;
  index: number;
  onOpenDrawer: (row: ContentRow) => void;
  onCopy: (text: string, label: string, key: string) => void;
  copiedKey: string | null;
  isDone: boolean;
  onToggleDone: (row: ContentRow) => void;
}

export function ContentCard({
  row,
  index,
  onOpenDrawer,
  onCopy,
  copiedKey,
  isDone,
  onToggleDone,
}: ContentCardProps) {
  const cardKey = `card-${row.product}-${index}`;
  const rowMarkdown = generateRowMarkdown(row);
  const displayId = row.documentName || `#${index + 1}`;

  const getProductBadgeStyle = (product: string) => {
    const p = product.toLowerCase();
    if (p.includes('allbuddy')) return 'bg-amber-50 text-amber-800 border-amber-200/80';
    if (p.includes('deckwale')) return 'bg-indigo-50 text-indigo-800 border-indigo-200/80';
    if (p.includes('fwc')) return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    if (p.includes('seedicon')) return 'bg-purple-50 text-purple-800 border-purple-200/80';
    return 'bg-orange-50 text-orange-800 border-orange-200/80';
  };

  const getPlatformStyle = (platform: string) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('linkedin')) return 'bg-sky-50 text-sky-800 border-sky-100';
    if (p.includes('instagram')) return 'bg-pink-50 text-pink-800 border-pink-100';
    if (p.includes('twitter') || p.includes('x')) return 'bg-stone-100 text-stone-800 border-stone-200';
    if (p.includes('youtube') || p.includes('shorts')) return 'bg-red-50 text-red-800 border-red-100';
    return 'bg-stone-100 text-stone-700 border-stone-200';
  };

  return (
    <article
      id={`item-${index}`}
      onClick={() => onOpenDrawer(row)}
      className={`group bg-white rounded-xl p-5 border transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs ${
        isDone
          ? 'border-emerald-200/80 bg-emerald-50/20 hover:border-emerald-300'
          : 'border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/30'
      }`}
    >
      {/* Top Metadata Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tactile Checkbox Toggle (No 'todo' text copy) */}
          <button
            type="button"
            id={`todo-toggle-${index}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleDone(row);
            }}
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isDone
                ? 'bg-emerald-500 border-2 border-emerald-500 text-white shadow-2xs'
                : 'border-2 border-stone-300 hover:border-orange-500 bg-white hover:bg-orange-50/40 text-transparent'
            }`}
            title={isDone ? 'Mark as pending' : 'Mark as completed'}
          >
            <Check className={`w-3.5 h-3.5 stroke-[3] ${isDone ? 'block' : 'opacity-0 hover:opacity-40 text-stone-400'}`} />
          </button>

          {/* Product Badge */}
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${getProductBadgeStyle(row.product)}`}>
            {row.product}
          </span>

          {/* Platform Badge */}
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${getPlatformStyle(row.platform)}`}>
            {row.platform || 'Platform'}
          </span>

          {/* Content Type */}
          {row.contentType && (
            <span className="text-xs font-normal px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200/60">
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

        {/* Post ID & Date / Open Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-stone-600 bg-stone-100/90 px-2 py-0.5 rounded-md border border-stone-200/80">
            {displayId}
          </span>
          <div className="w-6 h-6 rounded-md bg-stone-100 group-hover:bg-stone-900 group-hover:text-white text-stone-400 flex items-center justify-center transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Post Hook Title & Timeline */}
      <div className="space-y-1">
        <h3
          className={`text-sm sm:text-base font-bold tracking-tight leading-snug group-hover:text-orange-600 transition-colors line-clamp-2 ${
            isDone ? 'text-stone-600 line-through decoration-stone-300' : 'text-stone-900'
          }`}
        >
          {row.postHook || 'Untitled post hook'}
        </h3>
        <p className="text-xs text-stone-500 flex items-center gap-1.5 truncate">
          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="font-semibold text-stone-700">{row.date}</span>
          {row.day || row.week ? (
            <span>({[row.week, row.day].filter(Boolean).join(', ')})</span>
          ) : null}
          {row.targetAudience ? (
            <span className="hidden md:inline text-stone-400">• {row.targetAudience}</span>
          ) : null}
        </p>
      </div>

      {/* Surface Action Row */}
      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-stone-100 text-xs">
        <span className="text-stone-400 group-hover:text-stone-600 transition-colors font-medium text-xs">
          View details & customize fields →
        </span>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {row.aiImagePrompt && (
            <button
              type="button"
              id={`quick-copy-prompt-${index}`}
              onClick={() =>
                onCopy(row.aiImagePrompt, 'AI image prompt', `prompt-${cardKey}`)
              }
              className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 active:scale-[0.98] text-orange-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-orange-200/70 transition-all cursor-pointer"
              title="Copy AI image prompt only"
            >
              {copiedKey === `prompt-${cardKey}` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Copy prompt</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            id={`quick-copy-markdown-${index}`}
            onClick={() => onCopy(rowMarkdown, 'Post markdown', `md-${cardKey}`)}
            className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
            title="Copy full markdown block"
          >
            {copiedKey === `md-${cardKey}` ? (
              <>
                <Check className="w-3.5 h-3.5 text-orange-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-orange-400" />
                <span>Copy markdown</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

