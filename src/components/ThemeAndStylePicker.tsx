import React from 'react';
import { ThemeStyle, FrameStyle, FormatType } from '../types';
import { Palette, Layers } from 'lucide-react';

interface ThemeAndStylePickerProps {
  format: FormatType;
  themeStyle: ThemeStyle;
  frameStyle: FrameStyle;
  onChangeTheme: (theme: ThemeStyle) => void;
  onChangeFrameStyle: (frame: FrameStyle) => void;
}

const THEMES: { id: ThemeStyle; label: string; bg: string }[] = [
  {
    id: 'goa_vintage',
    label: 'Goa Vintage',
    bg: 'bg-gradient-to-r from-emerald-700 via-amber-600 to-rose-600',
  },
  {
    id: 'goa_sunset',
    label: 'Goa Sunset',
    bg: 'bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500',
  },
  {
    id: 'cyber_ocean',
    label: 'Cyber Ocean',
    bg: 'bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-500',
  },
  {
    id: 'obsidian_gold',
    label: 'Obsidian Gold',
    bg: 'bg-gradient-to-r from-zinc-900 via-amber-800 to-yellow-600',
  },
  {
    id: 'minimal_white',
    label: 'Minimal Light',
    bg: 'bg-gradient-to-r from-slate-100 to-slate-300',
  },
];

const FRAME_STYLES: { id: FrameStyle; label: string; desc: string }[] = [
  { id: 'classic_ring', label: 'Classic Curved Ring', desc: 'Curved event arc text & status badge' },
  { id: 'cyber_brackets', label: 'Cyber Brackets', desc: 'Futuristic HUD corner brackets' },
  { id: 'sunset_wave', label: 'Sunset Wave', desc: 'Vibrant Goa tropical gradient' },
  { id: 'gold_laurel', label: 'Obsidian Gold', desc: 'Luxury dark obsidian with crest' },
  { id: 'minimal_hex', label: 'Minimal Octagon', desc: 'Sleek geometric border' },
];

export const ThemeAndStylePicker: React.FC<ThemeAndStylePickerProps> = ({
  format,
  themeStyle,
  frameStyle,
  onChangeTheme,
  onChangeFrameStyle,
}) => {
  return (
    <div className="w-full space-y-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      {/* Theme Picker */}
      <div className="space-y-2">
        <label className="font-mono text-[11px] font-semibold text-zinc-300 tracking-wider uppercase flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-amber-400" />
          <span>4. Color Theme Palette</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeTheme(t.id)}
              className={`flex flex-col items-center gap-1.5 rounded-lg p-2 text-center border transition-all cursor-pointer ${
                themeStyle === t.id
                  ? 'bg-zinc-950 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/50'
                  : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className={`h-3 w-full rounded ${t.bg}`} />
              <span className="font-semibold text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Style Picker (Format A only) */}
      {format === 'frame' && (
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <label className="font-mono text-[11px] font-semibold text-zinc-300 tracking-wider uppercase flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-zinc-400" />
            <span>5. Frame Art Style</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FRAME_STYLES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChangeFrameStyle(f.id)}
                className={`flex flex-col items-start rounded-lg p-2.5 text-left border transition-all cursor-pointer ${
                  frameStyle === f.id
                    ? 'bg-zinc-950 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/50'
                    : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="font-semibold text-zinc-100 text-xs">{f.label}</span>
                <span className="text-zinc-500 text-[11px] mt-0.5">{f.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

