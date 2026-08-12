import React from 'react';
import { motion } from 'motion/react';
import { PhotoFilter } from '../../types';

interface VibeStepProps {
  value: PhotoFilter;
  onChange: (filter: PhotoFilter) => void;
  photoDataUrl?: string | null;
  hasPhoto: boolean;
}

export interface VibeOption {
  id: PhotoFilter;
  label: string;
  css: string;
  hint: string;
}

export const VIBES: VibeOption[] = [
  { id: 'none', label: 'NORMAL', css: 'none', hint: 'as-is' },
  { id: 'sunkissed', label: 'GOA SUNSET', css: 'sepia(0.4) saturate(1.5) hue-rotate(-10deg) brightness(1.05)', hint: 'golden hour' },
  { id: 'cyberpunk', label: 'CYBERPUNK', css: 'saturate(1.7) contrast(1.15) hue-rotate(315deg)', hint: 'neon drift' },
  { id: 'cinematic', label: 'CINEMATIC', css: 'contrast(1.18) saturate(0.85) brightness(0.95) sepia(0.18)', hint: 'film grade' },
  { id: 'vivid', label: 'VIVID', css: 'saturate(1.8) contrast(1.22) brightness(1.05)', hint: 'max pop' },
  { id: 'bw', label: 'B&W', css: 'grayscale(1) contrast(1.15)', hint: 'mono mood' },
];

const PLACEHOLDER_GRADIENTS: Record<PhotoFilter, string> = {
  none: 'linear-gradient(135deg,#3a5a6e,#c46a4a)',
  sunkissed: 'linear-gradient(135deg,#c46a4a,#f3c85c)',
  cyberpunk: 'linear-gradient(135deg,#7a1f6b,#4de2ff)',
  cinematic: 'linear-gradient(135deg,#2a3b33,#a8a29e)',
  vivid: 'linear-gradient(135deg,#22d3ee,#f43f5e)',
  bw: 'linear-gradient(135deg,#27272a,#d4d4d8)',
};

export const VibeStep: React.FC<VibeStepProps> = ({ value, onChange, photoDataUrl, hasPhoto }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {VIBES.map((vibe, i) => {
          const active = value === vibe.id;
          return (
            <motion.button
              key={vibe.id}
              type="button"
              onClick={() => onChange(vibe.id)}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative aspect-[4/5] overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                active
                  ? 'border-[#f3c85c] shadow-[0_0_28px_rgba(243,200,92,0.35)]'
                  : 'border-[#d4af37]/25 hover:border-[#d4af37]/70'
              }`}
            >
              {/* preview */}
              {hasPhoto && photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt={vibe.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ filter: vibe.css }}
                  draggable={false}
                />
              ) : (
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                  style={{ background: PLACEHOLDER_GRADIENTS[vibe.id] }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />

              {/* label */}
              <div className="absolute inset-x-0 bottom-0 p-2 text-left">
                <p
                  className={`font-display text-[11px] sm:text-xs leading-tight tracking-wide ${
                    active ? 'text-[#f3c85c]' : 'text-[#f7eec8]'
                  }`}
                >
                  {vibe.label}
                </p>
                <p className="mono-tag text-[9px] text-[#a2b8ad] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {vibe.hint}
                </p>
              </div>

              {/* active tick */}
              <span
                className={`absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                  active
                    ? 'border-[#f3c85c] bg-[#f3c85c] text-[#071712]'
                    : 'border-white/30 bg-black/40 text-transparent'
                }`}
              >
                ✓
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="mono-tag mt-3 text-[#3f5a50]">
        {hasPhoto ? 'hover to preview — click to lock the vibe' : 'upload a photo to see live previews'}
      </p>
    </div>
  );
};
