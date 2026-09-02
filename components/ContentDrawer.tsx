'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Sparkles,
  Eye,
  FileText,
  CheckSquare,
  Square,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ContentRow } from '@/lib/types';
import {
  generateCustomMarkdown,
  MarkdownExportOptions,
  DEFAULT_EXPORT_OPTIONS,
} from '@/lib/markdown-template';

interface ContentDrawerProps {
  row: ContentRow | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (text: string, label: string, key: string) => void;
  copiedKey: string | null;
}

export function ContentDrawer({
  row,
  isOpen,
  onClose,
  onCopy,
  copiedKey,
}: ContentDrawerProps) {
  const [exportOptions, setExportOptions] = useState<MarkdownExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const [showRawMarkdown, setShowRawMarkdown] = useState<boolean>(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !row) return null;

  const toggleOption = (key: keyof MarkdownExportOptions) => {
    setExportOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectAll = () => {
    setExportOptions({
      includeHeader: true,
      includeMeta: true,
      includeHook: true,
      includeVisualDirection: true,
      includeCaption: true,
      includeHashtags: true,
      includeCta: true,
      includeAiPrompt: true,
    });
  };

  const deselectAll = () => {
    setExportOptions({
      includeHeader: false,
      includeMeta: false,
      includeHook: false,
      includeVisualDirection: false,
      includeCaption: false,
      includeHashtags: false,
      includeCta: false,
      includeAiPrompt: false,
    });
  };

  const customMarkdown = generateCustomMarkdown(row, exportOptions);
  const displayId = row.documentName || 'Scraped post details';

  const getPlatformStyle = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('linkedin')) return 'bg-sky-50 text-sky-800';
    if (p.includes('instagram')) return 'bg-pink-50 text-pink-800';
    if (p.includes('twitter') || p.includes('x')) return 'bg-stone-100 text-stone-800';
    if (p.includes('youtube') || p.includes('shorts')) return 'bg-red-50 text-red-800';
    return 'bg-purple-50 text-purple-800';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/25 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <aside
          aria-labelledby="drawer-title"
          className="w-screen max-w-xl bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.08)] border-l border-stone-200 flex flex-col animate-in slide-in-from-right duration-200"
        >
          {/* Drawer Top Header */}
          <div className="px-5 py-4 border-b border-stone-100 flex items-start justify-between gap-3 sticky top-0 bg-white z-10">
            <div className="space-y-1 flex-1 pr-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-800">
                  {row.product}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-md ${getPlatformStyle(
                    row.platform
                  )}`}
                >
                  {row.platform || 'Platform'}
                </span>
                <span className="text-[11px] font-mono font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                  {displayId}
                </span>
              </div>
              <h2
                id="drawer-title"
                className="text-base font-bold text-stone-900 tracking-tight leading-snug"
              >
                {row.postHook || 'Post details'}
              </h2>
            </div>

            <button
              type="button"
              id="close-drawer-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Bar & Checklist Section */}
          <div className="px-5 py-3.5 bg-stone-50/70 border-b border-stone-200/80 space-y-3">
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="drawer-copy-markdown-btn"
                onClick={() =>
                  onCopy(customMarkdown, 'Selected markdown', 'drawer-markdown')
                }
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
              >
                {copiedKey === 'drawer-markdown' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Markdown copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy selected markdown</span>
                  </>
                )}
              </button>

              {row.aiImagePrompt && (
                <button
                  type="button"
                  id="drawer-copy-prompt-btn"
                  onClick={() =>
                    onCopy(row.aiImagePrompt, 'AI image prompt', 'drawer-prompt')
                  }
                  className="inline-flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  {copiedKey === 'drawer-prompt' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-orange-400" />
                      <span>Prompt copied!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                      <span>Copy prompt only</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Compact Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-stone-600 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-orange-500" />
                  Include in copy:
                </span>
                <div className="flex items-center gap-2 font-medium">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    Select all
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    Deselect all
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {[
                  { key: 'includeHeader', label: 'Platform & pillar' },
                  { key: 'includeMeta', label: 'Product & date' },
                  { key: 'includeHook', label: 'Post hook & type' },
                  { key: 'includeVisualDirection', label: 'Visual direction' },
                  { key: 'includeCaption', label: 'Caption' },
                  { key: 'includeHashtags', label: 'Hashtags' },
                  { key: 'includeCta', label: 'Call to action' },
                  { key: 'includeAiPrompt', label: 'AI image prompt' },
                ].map(({ key, label }) => {
                  const optKey = key as keyof MarkdownExportOptions;
                  const isChecked = exportOptions[optKey];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleOption(optKey)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-left text-[11px] transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-orange-100/70 text-orange-950 font-medium'
                          : 'bg-white text-stone-400 hover:bg-stone-100 border border-stone-200/60'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3 h-3 text-orange-600 shrink-0" />
                      ) : (
                        <Square className="w-3 h-3 text-stone-400 shrink-0" />
                      )}
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
            {/* Overview Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-stone-50 rounded-lg border border-stone-100">
              <div>
                <span className="text-stone-400 font-medium block">Date:</span>
                <span className="text-stone-800 font-semibold">{row.date || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Timeline:</span>
                <span className="text-stone-800 font-semibold">
                  {[row.week, row.day].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Content type:</span>
                <span className="text-stone-800 font-semibold">{row.contentType || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Content pillar:</span>
                <span className="text-stone-800 font-semibold">{row.contentPillar || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Primary KPI:</span>
                <span className="text-stone-800 font-semibold">{row.primaryKPI || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block">Secondary KPI:</span>
                <span className="text-stone-800 font-semibold">{row.secondaryKPI || '—'}</span>
              </div>
            </div>

            {/* Target Audience & Intent */}
            {(row.targetAudience || row.contentIntent) && (
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-100 space-y-2.5">
                {row.targetAudience && (
                  <div>
                    <span className="text-stone-400 font-medium block mb-0.5">Target audience:</span>
                    <p className="text-stone-800 leading-relaxed font-medium">{row.targetAudience}</p>
                  </div>
                )}
                {row.targetAudience && row.contentIntent && <div className="h-px bg-stone-200/60" />}
                {row.contentIntent && (
                  <div>
                    <span className="text-stone-400 font-medium block mb-0.5">Content intent:</span>
                    <p className="text-stone-700 leading-relaxed">{row.contentIntent}</p>
                  </div>
                )}
              </div>
            )}

            {/* Visual Direction Callout */}
            {row.visualDirection && (
              <div className="p-3.5 bg-orange-50/50 rounded-lg border-l-2 border-orange-400 space-y-1">
                <div className="font-semibold text-orange-900 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-orange-500" />
                  Visual direction
                </div>
                <p className="text-stone-700 leading-relaxed">{row.visualDirection}</p>
              </div>
            )}

            {/* AI Image Generation Prompt Highlight */}
            {row.aiImagePrompt && (
              <div className="p-3.5 bg-amber-50/40 rounded-lg border border-amber-200/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    AI image generation prompt
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(row.aiImagePrompt, 'AI image prompt', 'prompt-card')
                    }
                    className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'prompt-card' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-stone-800 font-mono text-[11px] leading-relaxed bg-white p-2.5 rounded-md border border-amber-100">
                  {row.aiImagePrompt}
                </p>
              </div>
            )}

            {/* Detailed Caption */}
            {row.detailedCaption && (
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-semibold">Detailed caption:</span>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(row.detailedCaption, 'Caption', 'caption-only')
                    }
                    className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] cursor-pointer"
                  >
                    {copiedKey === 'caption-only' ? 'Copied!' : 'Copy caption only'}
                  </button>
                </div>
                <div className="bg-white p-3 rounded-md border border-stone-200/60 text-stone-800 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                  {row.detailedCaption}
                </div>
              </div>
            )}

            {/* Hashtags & CTA */}
            {(row.hashtags || row.cta) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {row.hashtags && (
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                    <span className="text-stone-400 font-medium block mb-0.5">Hashtags:</span>
                    <span className="text-orange-600 font-medium break-words leading-relaxed">
                      {row.hashtags}
                    </span>
                  </div>
                )}
                {row.cta && (
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                    <span className="text-stone-400 font-medium block mb-0.5">Call to action:</span>
                    <span className="text-emerald-700 font-semibold leading-relaxed">
                      {row.cta}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Live Markdown Preview */}
            <div className="rounded-lg border border-stone-200 overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowRawMarkdown(!showRawMarkdown)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-stone-600 hover:bg-stone-50 transition-colors font-medium cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-semibold text-stone-800">
                  <FileText className="w-3.5 h-3.5 text-orange-500" />
                  Live markdown preview (ready for ChatGPT)
                </span>
                {showRawMarkdown ? (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </button>

              {showRawMarkdown && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-1.5 border-t border-stone-100">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>Generated output:</span>
                    <button
                      type="button"
                      onClick={() =>
                        onCopy(customMarkdown, 'Selected markdown', 'preview-copy')
                      }
                      className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                    >
                      {copiedKey === 'preview-copy' ? 'Copied!' : 'Copy raw block'}
                    </button>
                  </div>
                  <pre className="bg-stone-900 text-stone-100 p-3 rounded-md text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {customMarkdown || '(No sections selected)'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
