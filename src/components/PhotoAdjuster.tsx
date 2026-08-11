import React from 'react';
import { PhotoTransform, PhotoFilter } from '../types';
import { Move, ZoomIn, RotateCw, Sparkles, RefreshCw } from 'lucide-react';

interface PhotoAdjusterProps {
  transform: PhotoTransform;
  onChangeTransform: (newTransform: PhotoTransform) => void;
  photoDataUrl?: string | null;
}

const FILTERS: { id: PhotoFilter; label: string }[] = [
  { id: 'none', label: 'Normal' },
  { id: 'sunkissed', label: 'Goa Sunset' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'vivid', label: 'Vivid' },
  { id: 'bw', label: 'B&W Mono' },
];

export const PhotoAdjuster: React.FC<PhotoAdjusterProps> = ({
  transform,
  onChangeTransform,
}) => {
  const handleReset = () => {
    onChangeTransform({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      filter: 'none',
    });
  };

  return (
    <div className="w-full space-y-3.5 rounded-xl border border-[#d4af37]/30 bg-[#0c221a]/80 p-4">
      <div className="flex items-center justify-between">
        <label className="font-mono text-[11px] font-semibold text-[#f7eec8] tracking-wider uppercase flex items-center gap-1.5">
          <Move className="h-3.5 w-3.5 text-[#f3c85c]" />
          <span>Adjust &amp; Position Photo</span>
        </label>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 text-[#a2b8ad] hover:text-[#f3c85c] text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Zoom Scale Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-[#a2b8ad] font-medium">
          <span className="flex items-center gap-1">
            <ZoomIn className="h-3.5 w-3.5 text-[#f3c85c]" />
            <span>Zoom / Size</span>
          </span>
          <span className="text-[#f3c85c] font-mono text-[11px] font-bold">{transform.scale.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.05"
          value={transform.scale}
          onChange={(e) =>
            onChangeTransform({ ...transform, scale: parseFloat(e.target.value) })
          }
          className="w-full h-2 bg-[#071712] rounded-lg appearance-none cursor-pointer accent-[#f3c85c] my-1"
        />
      </div>

      {/* Position Offset X & Y */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#a2b8ad] font-medium">
            <span>Pan Horizontal</span>
            <span className="text-[#f7eec8] font-mono">{transform.x}px</span>
          </div>
          <input
            type="range"
            min="-200"
            max="200"
            step="5"
            value={transform.x}
            onChange={(e) =>
              onChangeTransform({ ...transform, x: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 bg-[#071712] rounded-lg appearance-none cursor-pointer accent-[#f3c85c] my-1"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#a2b8ad] font-medium">
            <span>Pan Vertical</span>
            <span className="text-[#f7eec8] font-mono">{transform.y}px</span>
          </div>
          <input
            type="range"
            min="-200"
            max="200"
            step="5"
            value={transform.y}
            onChange={(e) =>
              onChangeTransform({ ...transform, y: parseInt(e.target.value, 10) })
            }
            className="w-full h-2 bg-[#071712] rounded-lg appearance-none cursor-pointer accent-[#f3c85c] my-1"
          />
        </div>
      </div>

      {/* Rotation Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-[#a2b8ad] font-medium">
          <span className="flex items-center gap-1">
            <RotateCw className="h-3.5 w-3.5 text-[#a2b8ad]" />
            <span>Rotation</span>
          </span>
          <span className="text-[#f7eec8] font-mono">{transform.rotation}°</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          step="5"
          value={transform.rotation}
          onChange={(e) =>
            onChangeTransform({ ...transform, rotation: parseInt(e.target.value, 10) })
          }
          className="w-full h-2 bg-[#071712] rounded-lg appearance-none cursor-pointer accent-[#f3c85c] my-1"
        />
      </div>

      {/* Photo Filters */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] text-[#a2b8ad] font-medium flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-[#f3c85c]" />
          <span>Color Filter</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onChangeTransform({ ...transform, filter: f.id })}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition-all cursor-pointer ${
                transform.filter === f.id
                  ? 'bg-[#f3c85c] text-[#071712] border-[#f3c85c] font-bold shadow-sm'
                  : 'bg-[#071712] border-[#d4af37]/20 text-[#c9b99a] hover:border-[#d4af37]/40 hover:text-[#f7eec8]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

