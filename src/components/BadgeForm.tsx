import React, { useState } from 'react';
import { BuilderData } from '../types';
import { User, Code, Sparkles, Loader2, Tag, AtSign, Flame, Moon, Compass, Coffee, Key, QrCode, MessageSquare } from 'lucide-react';
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
    <div className="w-full space-y-3.5 rounded-xl border border-[#d4af37]/30 bg-[#0c221a]/80 p-4">
      <label className="font-mono text-[11px] font-semibold text-[#f7eec8] tracking-wider uppercase flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-[#f3c85c]" />
          <span>3. Builder Information &amp; Stats</span>
        </span>
        <span className="text-[10px] text-[#f3c85c] font-bold bg-[#f3c85c]/15 px-2 py-0.5 rounded border border-[#f3c85c]/30">
          Front &amp; Back Details
        </span>
      </label>

      {/* Name & Twitter Handle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] text-[#a2b8ad] font-medium">Your Name / Alias</label>
          <input
            type="text"
            value={builder.name}
            onChange={(e) => onChangeBuilder({ ...builder, name: e.target.value })}
            placeholder="e.g. "
            className="w-full rounded-lg bg-[#071712] px-3 py-2 sm:py-1.5 text-sm sm:text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-[#a2b8ad] font-medium">X / Twitter Handle</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[#a2b8ad] text-xs font-semibold">@</span>
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
              className="w-full rounded-lg bg-[#071712] pl-7 pr-3 py-2 sm:py-1.5 text-sm sm:text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
            />
          </div>
        </div>
      </div>

      {/* Role & Tech Stack */}
      {isBadgeFormat && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-[#a2b8ad] font-medium">Role / Position</label>
            <input
              type="text"
              value={builder.role}
              onChange={(e) => onChangeBuilder({ ...builder, role: e.target.value })}
              placeholder="e.g. Designer / Developer"
              className="w-full rounded-lg bg-[#071712] px-3 py-2 sm:py-1.5 text-sm sm:text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[#a2b8ad] font-medium">Tech Stack</label>
            <input
              type="text"
              value={builder.stack}
              onChange={(e) => onChangeBuilder({ ...builder, stack: e.target.value })}
              placeholder="e.g. Figma • Blender • React • Coffee"
              className="w-full rounded-lg bg-[#071712] px-3 py-2 sm:py-1.5 text-sm sm:text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
            />
          </div>
        </div>
      )}

      {/* Builder Title + AI Generator */}
      {isBadgeFormat && (
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] text-[#a2b8ad] font-medium">Builder Title / Tagline</label>
            <button
              type="button"
              onClick={handleGenerateAiTitle}
              disabled={isGeneratingTitle}
              className="flex items-center gap-1 rounded-md bg-[#13382c] hover:bg-[#1a4738] px-2 py-0.5 text-[11px] font-medium text-[#f3c85c] border border-[#d4af37]/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingTitle ? (
                <Loader2 className="h-3 w-3 animate-spin text-[#f3c85c]" />
              ) : (
                <Sparkles className="h-3 w-3 text-[#f3c85c]" />
              )}
              <span>AI Title</span>
            </button>
          </div>
          <input
            type="text"
            value={builder.builderTitle}
            onChange={(e) => onChangeBuilder({ ...builder, builderTitle: e.target.value })}
            placeholder="e.g. Professional Jugaad Specialist"
            className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f3c85c] font-medium border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
          />
        </div>
      )}

      {/* Fun Poster Stats Fields (When Badge Format active) */}
      {isBadgeFormat && (
        <div className="pt-2 border-t border-[#d4af37]/20 space-y-3">
          <div className="text-[11px] font-mono font-semibold text-[#f3c85c] uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-[#f3c85c]" />
            <span>Poster Badges &amp; Stats</span>
          </div>

          {/* Photo Motto & Currently Building */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-[#a2b8ad] font-medium">Tagline Above Photo</label>
              <input
                type="text"
                value={builder.photoMotto || ''}
                onChange={(e) => onChangeBuilder({ ...builder, photoMotto: e.target.value })}
                placeholder="e.g. BANWA RAHA HOON HISTORY."
                className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#a2b8ad] font-medium">Currently Building</label>
              <input
                type="text"
                value={builder.currentlyBuilding || ''}
                onChange={(e) => onChangeBuilder({ ...builder, currentlyBuilding: e.target.value })}
                placeholder="e.g. खुद को और कुछ धांसू चीज़ें"
                className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
              />
            </div>
          </div>

          {/* Side Quest */}
          <div className="space-y-1">
            <label className="text-[11px] text-[#a2b8ad] font-medium">Side Quest</label>
            <input
              type="text"
              value={builder.sideQuest || ''}
              onChange={(e) => onChangeBuilder({ ...builder, sideQuest: e.target.value })}
              placeholder="e.g. Startups • Travel • Food"
              className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
            />
          </div>

          {/* Chaos Level Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#a2b8ad] font-medium">Chaos Level</span>
              <span className="font-mono text-[#f3c85c] font-bold">{builder.chaosLevel ?? 82}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={builder.chaosLevel ?? 82}
              onChange={(e) => onChangeBuilder({ ...builder, chaosLevel: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-[#071712] rounded-lg appearance-none cursor-pointer accent-[#f3c85c]"
            />
          </div>

          {/* Powered By */}
          <div className="space-y-1">
            <label className="text-[11px] text-[#a2b8ad] font-medium">Powered By</label>
            <input
              type="text"
              value={builder.poweredBy || ''}
              onChange={(e) => onChangeBuilder({ ...builder, poweredBy: e.target.value })}
              placeholder="Chai + Jugaad"
              className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
            />
          </div>

          {/* Back Side QR Code URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] text-[#a2b8ad] font-medium flex items-center gap-1">
                <QrCode className="h-3 w-3 text-[#f3c85c]" />
                <span>Back Side QR Code Link</span>
              </label>
              <input
                type="text"
                value={builder.qrUrl || ''}
                onChange={(e) => onChangeBuilder({ ...builder, qrUrl: e.target.value })}
                placeholder={builder.handle ? `https://x.com/${extractXHandle(builder.handle)}` : "https://x.com/your_handle"}
                className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f3c85c] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#a2b8ad] font-medium">Front Punchline</label>
              <input
                type="text"
                value={builder.hindiPunchline || ''}
                onChange={(e) => onChangeBuilder({ ...builder, hindiPunchline: e.target.value })}
                placeholder="करेंगे सबका, छापेंगे अलग!"
                className="w-full rounded-lg bg-[#071712] px-3 py-1.5 text-xs text-[#f7eec8] border border-[#d4af37]/25 focus:border-[#f3c85c] focus:outline-none placeholder:text-[#527063]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Tag Pill Options */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] text-[#a2b8ad] font-medium flex items-center gap-1">
          <Tag className="h-3.5 w-3.5 text-[#f3c85c]" />
          <span>Status Badge Chip</span>
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
  );
};

