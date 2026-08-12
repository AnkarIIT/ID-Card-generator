import React, { useState } from 'react';
import { BuilderData } from '../types';
import { User, Code, Sparkles, Loader2, Tag, AtSign, Flame, Moon, Compass, Coffee, Key, QrCode, MessageSquare, Rocket } from 'lucide-react';
import { extractXHandle } from '../utils/urlUtils';

interface BadgeFormProps {
  builder: BuilderData;
  onChangeBuilder: (newBuilder: BuilderData) => void;
  isBadgeFormat: boolean;
}

const STATUS_TAGS = [
  'VERIFIED BUILDER',
  'ATTENDING',
  'HACKER PASS',
  'SPEAKER',
  'WEB3 NATIVE',
  'VIP PASS',
];

export const BadgeForm: React.FC<BadgeFormProps> = ({
  builder,
  onChangeBuilder,
  isBadgeFormat,
}) => {
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  // Call backend Gemini AI title generator
  const handleGenerateAiTitle = async () => {
    try {
      setIsGeneratingTitle(true);
      const res = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: builder.name,
          role: builder.role,
          stack: builder.stack,
        }),
      });

      const data = await res.json();
      if (data.titles && data.titles.length > 0) {
        const randomTitle = data.titles[Math.floor(Math.random() * data.titles.length)];
        onChangeBuilder({ ...builder, builderTitle: randomTitle });
      }
    } catch (err) {
      console.error('Failed to generate title:', err);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  return (
    <div className="w-full space-y-4 rounded-xl border border-[#d4af37]/20 bg-[#071712]/50 p-4">
      {/* 02 / Identity */}
      <div className="space-y-3">
        <label className="font-mono text-[11px] font-semibold text-[#f3c85c] tracking-wider uppercase">
          02 / Identity
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-[#a2b8ad] font-medium">Your Name / Alias</label>
            <input
              type="text"
              value={builder.name}
              onChange={(e) => onChangeBuilder({ ...builder, name: e.target.value })}
              placeholder="e.g. Banwa Kumar"
              className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-sm text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063] font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[#a2b8ad] font-medium">X / Twitter Handle</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#a2b8ad] text-xs font-bold">@</span>
              <input
                type="text"
                value={builder.handle ? extractXHandle(builder.handle) : ''}
                onChange={(e) => {
                  const rawVal = e.target.value;
                  const cleaned = extractXHandle(rawVal);
                  onChangeBuilder({
                    ...builder,
                    handle: cleaned,
                    qrUrl: cleaned ? `https://x.com/${cleaned}` : ''
                  });
                }}
                placeholder="shashwat_kumar"
                className="w-full rounded-lg bg-[#071712] pl-7 pr-3 py-1.5 text-sm text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063] font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 03 / Role & Stack */}
      {isBadgeFormat && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-[#a2b8ad] font-medium">Role / Position</label>
              <input
                type="text"
                value={builder.role}
                onChange={(e) => onChangeBuilder({ ...builder, role: e.target.value })}
                placeholder="e.g. Creative Technologist"
                className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#a2b8ad] font-medium">Tech Stack</label>
              <input
                type="text"
                value={builder.stack}
                onChange={(e) => onChangeBuilder({ ...builder, stack: e.target.value })}
                placeholder="e.g. React • Vite • Canvas • Goa vibes"
                className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063] font-mono"
              />
            </div>
          </div>

          {/* Builder Title + AI Generator */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-[#a2b8ad] font-medium">Builder Title / Tagline</label>
              <button
                type="button"
                onClick={handleGenerateAiTitle}
                disabled={isGeneratingTitle}
                className="flex items-center gap-1 rounded-md bg-[#071712] hover:bg-[#10271a] px-2 py-0.5 text-[11px] font-medium text-[#f3c85c] border border-[#d4af37]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingTitle ? (
                  <Loader2 className="h-3 w-3 animate-spin text-[#f3c85c]" />
                ) : (
                  <Sparkles className="h-3 w-3 text-[#f3c85c]" />
                )}
                <span>AI</span>
              </button>
            </div>
            <input
              type="text"
              value={builder.builderTitle}
              onChange={(e) => onChangeBuilder({ ...builder, builderTitle: e.target.value })}
              placeholder="e.g. Professional Jugaad Specialist"
              className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063] font-mono"
            />
          </div>
        </div>
      )}

      {/* 04 / Stats & QR */}
      <div className="pt-2 border-t border-[#d4af37]/15 space-y-3">
        <div className="text-[11px] font-mono font-semibold text-[#f3c85c] uppercase tracking-wider">
          04 / Stats & QR
        </div>

        <div className="space-y-2">
          {/* Back Side QR Code URL */}
          <div className="space-y-1">
            <label className="text-[11px] text-[#a2b8ad] font-medium flex items-center gap-1">
              <QrCode className="h-3 w-3 text-[#f3c85c]" />
              <span>QR Code URL</span>
            </label>
            <input
              type="text"
              value={builder.qrUrl || ''}
              onChange={(e) => onChangeBuilder({ ...builder, qrUrl: e.target.value })}
              placeholder={builder.handle ? `https://x.com/${extractXHandle(builder.handle)}` : "https://x.com/your_handle"}
              className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063] font-mono"
            />
          </div>

          {/* Status Tag */}
          <div className="space-y-1">
            <label className="text-[11px] text-[#a2b8ad] font-medium flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-[#f3c85c]" />
              <span>Status Badge</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUS_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onChangeBuilder({ ...builder, statusTag: tag })}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all cursor-pointer border ${
                    builder.statusTag === tag
                      ? 'bg-[#f3c85c] text-[#071712] border-[#f3c85c] font-bold shadow-sm'
                      : 'bg-[#071712] border-[#d4af37]/20 text-[#c9b99a] hover:text-[#f7eec8] hover:border-[#d4af37]/40'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};