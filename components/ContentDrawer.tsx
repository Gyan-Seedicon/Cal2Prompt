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
    if (p.includes('linkedin')) return 'bg-sky-50 text-sky-800 border-sky-100';
    if (p.includes('instagram')) return 'bg-pink-50 text-pink-800 border-pink-100';
    if (p.includes('twitter') || p.includes('x')) return 'bg-stone-100 text-stone-800 border-stone-200';
    if (p.includes('youtube') || p.includes('shorts')) return 'bg-red-50 text-red-800 border-red-100';
    return 'bg-purple-50 text-purple-800 border-purple-100';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <aside
          aria-labelledby="drawer-title"
          className="w-screen max-w-2xl bg-white shadow-[-8px_0_35px_rgba(0,0,0,0.08)] border-l border-stone-200 flex flex-col animate-in slide-in-from-right duration-200"
        >
          {/* Surface Container (Natural scroll, no sticky bars) */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Top Bar: Badges & Close Button */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-stone-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-orange-50 text-orange-800 border border-orange-100">
                  {row.product}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getPlatformStyle(
                    row.platform
                  )}`}
                >
                  {row.platform || 'Platform'}
                </span>
                <span className="text-xs font-mono font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                  {displayId}
                </span>
                {row.contentType && (
                  <span className="text-xs font-normal px-2.5 py-1 rounded-md bg-stone-100 text-stone-700">
                    {row.contentType}
                  </span>
                )}
              </div>

              <button
                type="button"
                id="close-drawer-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Post Hook Title & Meta */}
            <div className="space-y-2">
              <h2
                id="drawer-title"
                className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight leading-snug"
              >
                {row.postHook || 'Post details'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="font-semibold text-stone-700">{row.date}</span>
                {row.day || row.week ? (
                  <span>• {[row.week, row.day].filter(Boolean).join(', ')}</span>
                ) : null}
                {row.contentPillar ? <span>• {row.contentPillar}</span> : null}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                id="drawer-copy-markdown-btn"
                onClick={() =>
                  onCopy(customMarkdown, 'Selected markdown', 'drawer-markdown')
                }
                className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all cursor-pointer"
              >
                {copiedKey === 'drawer-markdown' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Markdown copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
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
                  className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  {copiedKey === 'drawer-prompt' ? (
                    <>
                      <Check className="w-4 h-4 text-orange-400" />
                      <span>Prompt copied!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <span>Copy prompt only</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Customizable Checklist (Direct on Surface) */}
            <div className="py-3 border-y border-stone-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-500" />
                  Include in copy
                </span>
                <div className="flex items-center gap-2 font-medium">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
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
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-orange-100/70 text-orange-950 font-medium'
                          : 'bg-stone-50 text-stone-400 hover:bg-stone-100 border border-stone-200/60'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      )}
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Overview Metadata Table (Direct on Surface) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 py-2 text-xs">
              <div>
                <span className="text-stone-400 font-medium block text-xs">Date</span>
                <span className="text-stone-900 font-semibold text-sm">{row.date || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block text-xs">Timeline</span>
                <span className="text-stone-900 font-semibold text-sm">
                  {[row.week, row.day].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block text-xs">Content type</span>
                <span className="text-stone-900 font-semibold text-sm">{row.contentType || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block text-xs">Content pillar</span>
                <span className="text-stone-900 font-semibold text-sm">{row.contentPillar || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block text-xs">Primary KPI</span>
                <span className="text-stone-900 font-semibold text-sm">{row.primaryKPI || '—'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium block text-xs">Secondary KPI</span>
                <span className="text-stone-900 font-semibold text-sm">{row.secondaryKPI || '—'}</span>
              </div>
            </div>

            {/* Target Audience & Intent */}
            {(row.targetAudience || row.contentIntent) && (
              <div className="py-3 border-t border-stone-100 space-y-3 text-xs">
                {row.targetAudience && (
                  <div>
                    <span className="text-stone-400 font-medium block text-xs mb-1">Target audience</span>
                    <p className="text-stone-800 text-sm leading-relaxed font-normal">{row.targetAudience}</p>
                  </div>
                )}
                {row.contentIntent && (
                  <div>
                    <span className="text-stone-400 font-medium block text-xs mb-1">Content intent</span>
                    <p className="text-stone-800 text-sm leading-relaxed font-normal">{row.contentIntent}</p>
                  </div>
                )}
              </div>
            )}

            {/* Visual Direction Callout */}
            {row.visualDirection && (
              <div className="py-3 border-t border-stone-100 space-y-1.5 text-xs">
                <div className="font-bold text-orange-950 flex items-center gap-1.5 text-xs">
                  <Eye className="w-3.5 h-3.5 text-orange-600" />
                  Visual direction
                </div>
                <p className="text-stone-800 text-sm leading-relaxed pl-3.5 border-l-2 border-orange-400">
                  {row.visualDirection}
                </p>
              </div>
            )}

            {/* AI Image Generation Prompt Card */}
            {row.aiImagePrompt && (
              <div className="py-3 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    AI image generation prompt
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(row.aiImagePrompt, 'AI image prompt', 'prompt-card')
                    }
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'prompt-card' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 text-stone-900 font-mono text-xs leading-relaxed">
                  {row.aiImagePrompt}
                </div>
              </div>
            )}

            {/* Detailed Caption */}
            {row.detailedCaption && (
              <div className="py-3 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-700 font-bold text-xs">Detailed caption</span>
                  <button
                    type="button"
                    onClick={() =>
                      onCopy(row.detailedCaption, 'Caption', 'caption-only')
                    }
                    className="text-orange-600 hover:text-orange-700 font-semibold text-xs cursor-pointer"
                  >
                    {copiedKey === 'caption-only' ? 'Copied!' : 'Copy caption only'}
                  </button>
                </div>
                <div className="bg-stone-50/60 p-4 rounded-lg border border-stone-200/70 text-stone-900 text-sm leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto font-normal">
                  {row.detailedCaption}
                </div>
              </div>
            )}

            {/* Hashtags & CTA */}
            {(row.hashtags || row.cta) && (
              <div className="py-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {row.hashtags && (
                  <div className="space-y-1">
                    <span className="text-stone-400 font-medium block text-xs">Hashtags</span>
                    <span className="text-orange-600 text-xs font-medium break-words leading-relaxed">
                      {row.hashtags}
                    </span>
                  </div>
                )}
                {row.cta && (
                  <div className="space-y-1">
                    <span className="text-stone-400 font-medium block text-xs">Call to action</span>
                    <span className="text-emerald-700 text-xs font-semibold leading-relaxed">
                      {row.cta}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Live Markdown Preview */}
            <div className="pt-3 border-t border-stone-100 rounded-lg overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowRawMarkdown(!showRawMarkdown)}
                className="w-full py-2.5 flex items-center justify-between text-stone-700 hover:text-stone-900 transition-colors font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-2 text-stone-900">
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
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>Clean Markdown based on selected checkboxes:</span>
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
                  <pre className="bg-stone-900 text-stone-100 p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
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
