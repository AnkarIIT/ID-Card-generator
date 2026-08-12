import React, { useRef, useEffect, useState } from 'react';
import { CardConfig } from '../../types';
import { renderGraphicOnCanvas } from '../../utils/canvasRenderer';
import { RefreshCw } from 'lucide-react';

interface LiveCardProps {
  config: CardConfig;
  userImage: HTMLImageElement | null;
}

export const LiveCard: React.FC<LiveCardProps> = ({ config, userImage }) => {
  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (frontCanvasRef.current) {
      renderGraphicOnCanvas(frontCanvasRef.current, { ...config, side: 'front' }, userImage);
    }
    if (backCanvasRef.current) {
      renderGraphicOnCanvas(backCanvasRef.current, { ...config, side: 'back' }, userImage);
    }
  }, [config, userImage]);

  return (
    <div className="w-full">
      <div className="float-soft relative mx-auto w-full max-w-[330px]">
        {/* coordinate corner markers */}
        <span className="mono-tag pointer-events-none absolute -left-9 top-2 z-10 hidden text-[#3f5a50] sm:block">
          X 512
        </span>
        <span className="mono-tag pointer-events-none absolute -right-9 bottom-2 z-10 hidden text-[#3f5a50] sm:block">
          Y 768
        </span>
        <span className="mono-tag pointer-events-none absolute -left-9 bottom-10 z-10 hidden text-[#3f5a50] sm:block">
          +F
        </span>

        <div className="coord-ticks rounded-2xl p-2">
          <div
            onClick={() => setIsFlipped((f) => !f)}
            className="group relative aspect-[12/18.6] w-full cursor-pointer select-none"
            style={{ perspective: '1400px' }}
            title="click to flip"
          >
            <div
              className="relative h-full w-full transition-transform duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT */}
              <div
                className="absolute inset-0 overflow-hidden rounded-xl border border-[#d4af37]/40 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <canvas ref={frontCanvasRef} className="h-full w-full" />
              </div>
              {/* BACK */}
              <div
                className="absolute inset-0 overflow-hidden rounded-xl border border-[#d4af37]/40 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <canvas ref={backCanvasRef} className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="mono-tag flex items-center gap-1.5 text-[#f3c85c]">
          <span className="caret-blink inline-block h-1.5 w-1.5 rounded-full bg-[#f3c85c]" />
          LIVE
        </span>
        <button
          type="button"
          onClick={() => setIsFlipped((f) => !f)}
          className="mono-tag flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 px-3 py-1 text-[#a2b8ad] transition-all hover:border-[#f3c85c] hover:text-[#f3c85c] cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          {isFlipped ? 'SHOW FRONT' : 'SHOW BACK'}
        </button>
        <span className="mono-tag text-[#3f5a50]">1024 × 1536</span>
      </div>
    </div>
  );
};
