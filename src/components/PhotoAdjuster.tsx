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
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <label className="mono-tag flex items-center gap-2 text-[#a2b8ad]">
          <span className="text-[#f3c85c]">
            <Move className="h-3.5 w-3.5" />
          </span>
          ADJUST &amp; POSITION PHOTO
        </label>
        <button
          type="button"
          onClick={handleReset}
          className="mono-tag flex items-center gap-1.5 text-[#a2b8ad] transition-colors hover:text-[#f3c85c] cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          RESET
        </button>
      </div>

      {/* Zoom Scale Slider */}
      <div>
        <div className="flex justify-between text-xs text-[#a2b8ad] font-medium">
          <span className="flex items-center gap-1.5">
            <ZoomIn className="h-3.5 w-3.5 text-[#f3c85c]" />
            <span>Zoom / Size</span>
          </span>
          <span className="font-mono text-[11px] font-bold text-[#f3c85c]">{transform.scale.toFixed(2)}x</span>
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
        <div>
          <div className="flex justify-between text-[11px] text-[#a2b8ad] font-medium">
            <span>Pan Horizontal</span>
            <span className="font-mono text-[#f7eec8]">{transform.x}px</span>
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

        <div>
          <div className="flex justify-between text-[11px] text-[#a2b8ad] font-medium">
            <span>Pan Vertical</span>
            <span className="font-mono text-[#f7eec8]">{transform.y}px</span>
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
      <div>
        <div className="flex justify-between text-[11px] text-[#a2b8ad] font-medium">
          <span className="flex items-center gap-1.5">
            <RotateCw className="h-3.5 w-3.5 text-[#f3c85c]" />
            <span>Rotation</span>
          </span>
          <span className="font-mono text-[#f7eec8]">{transform.rotation}°</span>
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
      <div className="space-y-2">
        <label className="mono-tag flex items-center gap-2 text-[#a2b8ad]">
          <span className="text-[#f3c85c]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          COLOR FILTER
        </label>
        <div className="grid grid-cols-3 gap-2">
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

