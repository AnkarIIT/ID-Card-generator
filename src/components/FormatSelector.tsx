import React from 'react';
import { FormatType, CardSide } from '../types';
import { User, CreditCard, Layers, Smartphone, LayoutGrid } from 'lucide-react';

interface FormatSelectorProps {
  currentFormat: FormatType;
  currentSide: CardSide;
  onSelectFormat: (format: FormatType) => void;
  onSelectSide: (side: CardSide) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  currentFormat,
  currentSide,
  onSelectFormat,
  onSelectSide,
}) => {
  return (
    <div className="w-full space-y-3">
      <div>
        <label className="mb-2 block font-mono text-[11px] font-semibold text-[#f3c85c] tracking-wider uppercase">
          01 / Format
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Format A Button - PFP Frame */}
          <button
            type="button"
            onClick={() => onSelectFormat('frame')}
            className={`relative flex items-start p-3 rounded-xl text-left border transition-all duration-150 cursor-pointer ${
              currentFormat === 'frame'
                ? 'bg-[#102d22] border-[#f3c85c] text-[#f7eec8] shadow-md'
                : 'bg-[#071712]/60 border-[#d4af37]/20 text-[#a2b8ad] hover:border-[#f3c85c] hover:bg-[#0c2718]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md ${
                currentFormat === 'frame' ? 'bg-[#f3c85c]/20 text-[#f3c85c]' : 'bg-[#071712] text-[#a2b8ad]'
              }`}>
                <User className="h-4 w-4" />
              </div>
              {currentFormat === 'frame' && (
                <span className="text-[10px] font-mono font-bold text-[#f3c85c]">✓</span>
              )}
            </div>
            <div className="mt-1.5">
              <div className="font-semibold text-[#f7eec8] text-xs">PFP Frame</div>
              <p className="text-[#a2b8ad] text-[11px] leading-tight">
                Square 1200×1200px profile overlay
              </p>
            </div>
          </button>

          {/* Format B Button - Builder Badge */}
          <button
            type="button"
            onClick={() => onSelectFormat('badge')}
            className={`relative flex items-start p-3 rounded-xl text-left border transition-all duration-150 cursor-pointer ${
              currentFormat === 'badge'
                ? 'bg-[#102d22] border-[#f3c85c] text-[#f7eec8] shadow-md'
                : 'bg-[#071712]/60 border-[#d4af37]/20 text-[#a2b8ad] hover:border-[#f3c85c] hover:bg-[#0c2718]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md ${
                currentFormat === 'badge' ? 'bg-[#f3c85c]/20 text-[#f3c85c]' : 'bg-[#071712] text-[#a2b8ad]'
              }`}>
                <CreditCard className="h-4 w-4" />
              </div>
              {currentFormat === 'badge' && (
                <span className="text-[10px] font-mono font-bold text-[#f3c85c]">✓</span>
              )}
            </div>
            <div className="mt-1.5">
              <div className="font-semibold text-[#f7eec8] text-xs">Builder Badge</div>
              <p className="text-[#a2b8ad] text-[11px] leading-tight">
                2-sided Goa poster with QR
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Side Selector (Shown when Badge Format is active) */}
      {currentFormat === 'badge' && (
        <div className="rounded-xl bg-[#071712]/60 border border-[#d4af37]/20 space-y-2 p-3">
          <div className="text-[11px] font-mono font-semibold text-[#f7eec8] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#f3c85c]" />
            <span>01 / Side</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelectSide('front')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                currentSide === 'front'
                  ? 'bg-[#f3c85c] text-[#071712] border-[#f3c85c] font-bold shadow-sm'
                  : 'bg-[#071712] border-[#d4af37]/20 text-[#a2b8ad] hover:border-[#f3c85c]'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Front</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSide('back')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                currentSide === 'back'
                  ? 'bg-[#f3c85c] text-[#071712] border-[#f3c85c] font-bold shadow-sm'
                  : 'bg-[#071712] border-[#d4af37]/20 text-[#a2b8ad] hover:border-[#f3c85c]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};