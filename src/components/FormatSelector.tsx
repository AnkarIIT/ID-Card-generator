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
          1. Select Graphic Format
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Format A Button */}
          <button
            type="button"
            onClick={() => onSelectFormat('frame')}
            className={`relative flex flex-col items-start p-3.5 rounded-xl text-left border transition-all duration-150 cursor-pointer ${
              currentFormat === 'frame'
                ? 'bg-[#102d22] border-[#d4af37] text-[#f7eec8] shadow-md ring-1 ring-[#d4af37]/50'
                : 'bg-[#091b15]/70 border-[#d4af37]/20 text-[#a2b8ad] hover:border-[#d4af37]/40 hover:bg-[#0e271f]'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md ${currentFormat === 'frame' ? 'bg-[#f3c85c]/20 text-[#f3c85c]' : 'bg-[#071712] text-[#a2b8ad]'}`}>
                <User className="h-4 w-4" />
              </div>
              {currentFormat === 'frame' && (
                <span className="text-[10px] font-mono font-bold text-[#f3c85c] bg-[#f3c85c]/15 px-1.5 py-0.5 rounded border border-[#f3c85c]/30">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="font-semibold text-[#f7eec8] text-xs sm:text-sm">Format A: PFP Frame</div>
            <p className="mt-0.5 text-[#a2b8ad] text-[11px] leading-normal">
              Square 1200x1200px overlay frame for X/Twitter profile picture.
            </p>
          </button>

          {/* Format B Button */}
          <button
            type="button"
            onClick={() => onSelectFormat('badge')}
            className={`relative flex flex-col items-start p-3.5 rounded-xl text-left border transition-all duration-150 cursor-pointer ${
              currentFormat === 'badge'
                ? 'bg-[#102d22] border-[#d4af37] text-[#f7eec8] shadow-md ring-1 ring-[#d4af37]/50'
                : 'bg-[#091b15]/70 border-[#d4af37]/20 text-[#a2b8ad] hover:border-[#d4af37]/40 hover:bg-[#0e271f]'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md ${currentFormat === 'badge' ? 'bg-[#f3c85c]/20 text-[#f3c85c]' : 'bg-[#071712] text-[#a2b8ad]'}`}>
                <CreditCard className="h-4 w-4" />
              </div>
              {currentFormat === 'badge' && (
                <span className="text-[10px] font-mono font-bold text-[#f3c85c] bg-[#f3c85c]/15 px-1.5 py-0.5 rounded border border-[#f3c85c]/30">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="font-semibold text-[#f7eec8] text-xs sm:text-sm">Format B: Builder Badge</div>
            <p className="mt-0.5 text-[#a2b8ad] text-[11px] leading-normal">
              Goa Vintage 2-sided ID poster with stats &amp; QR code.
            </p>
          </button>
        </div>
      </div>

      {/* Side Selector (Shown when Badge Format is active) */}
      {currentFormat === 'badge' && (
        <div className="p-3 rounded-xl bg-[#0c221a]/80 border border-[#d4af37]/30 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono font-semibold text-[#f7eec8] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#f3c85c]" />
              <span>Card Side View</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelectSide('front')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                currentSide === 'front'
                  ? 'bg-[#f3c85c] text-[#071712] border-[#f3c85c] font-bold shadow-sm'
                  : 'bg-[#071712] text-[#c9b99a] border-[#d4af37]/20 hover:border-[#d4af37]/40'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Front Side</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSide('back')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                currentSide === 'back'
                  ? 'bg-[#f3c85c] text-[#071712] border-[#f3c85c] font-bold shadow-sm'
                  : 'bg-[#071712] text-[#c9b99a] border-[#d4af37]/20 hover:border-[#d4af37]/40'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Back Side</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


