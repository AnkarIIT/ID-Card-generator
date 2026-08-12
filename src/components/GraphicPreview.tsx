import React, { useRef, useEffect, useState } from 'react';
import { CardConfig, SavedShareResult } from '../types';
import { renderGraphicOnCanvas } from '../utils/canvasRenderer';
import confetti from 'canvas-confetti';
import {
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Loader2,
  RefreshCw,
  QrCode,
  X,
  Twitter,
  Linkedin,
  Send,
} from 'lucide-react';

interface GraphicPreviewProps {
  config: CardConfig;
  userImage: HTMLImageElement | null;
  onRefreshPhoto: () => void;
}

export const GraphicPreview: React.FC<GraphicPreviewProps> = ({
  config,
  userImage,
}) => {
  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isSharing, setIsSharing] = useState<string | null>(null);
  const [shareResult, setShareResult] = useState<SavedShareResult | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync side from config if changed externally
  useEffect(() => {
    if (config.side === 'back') {
      setIsFlipped(true);
    } else if (config.side === 'front') {
      setIsFlipped(false);
    }
  }, [config.side]);

  // Re-render canvases whenever config or loaded image changes
  useEffect(() => {
    if (config.format === 'frame') {
      if (frameCanvasRef.current) {
        renderGraphicOnCanvas(frameCanvasRef.current, config, userImage);
      }
    } else {
      if (frontCanvasRef.current) {
        renderGraphicOnCanvas(frontCanvasRef.current, { ...config, side: 'front' }, userImage);
      }
      if (backCanvasRef.current) {
        renderGraphicOnCanvas(backCanvasRef.current, { ...config, side: 'back' }, userImage);
      }
    }
  }, [config, userImage]);

  // Get active canvas for export
  const getActiveCanvas = (): HTMLCanvasElement | null => {
    if (config.format === 'frame') return frameCanvasRef.current;
    return isFlipped ? backCanvasRef.current : frontCanvasRef.current;
  };

  // Download High-Res PNG
  const handleDownload = (targetSide?: 'front' | 'back') => {
    let canvas: HTMLCanvasElement | null = null;
    if (config.format === 'frame') {
      canvas = frameCanvasRef.current;
    } else if (targetSide === 'front') {
      canvas = frontCanvasRef.current;
    } else if (targetSide === 'back') {
      canvas = backCanvasRef.current;
    } else {
      canvas = getActiveCanvas();
    }

    if (!canvas) return;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#f43f5e', '#fbbf24', '#f3c85c'],
      });
    } catch {}

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    const safeName = (config.builder.name || 'Builder').replace(/[^a-zA-Z0-9]/g, '_');
    const sideSuffix = config.format === 'frame' ? 'Frame' : targetSide || (isFlipped ? 'Back' : 'Front');
    const fileName = `HH_Goa_2026_${config.format === 'badge' ? 'Badge' : 'Frame'}_${sideSuffix}_${safeName}.png`;

    link.download = fileName;
    link.href = dataUrl;
    link.click();
  };

  // Unified Share handler for X
  const handleShare = async (platform: 'x' | 'linkedin') => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    try {
      setIsSharing(platform);
      const imageDataUrl = canvas.toDataURL('image/png', 0.92);

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.format,
          name: config.builder.name,
          role: config.builder.role,
          stack: config.builder.stack,
          builderTitle: config.builder.builderTitle,
          imageDataUrl,
        }),
      });

      const data = await response.json();
      if (data.success && data.shareUrl) {
        setShareResult(data);
        setShowShareModal(true);

        const titleText = config.format === 'badge'
          ? `Pumped to be building at Hacker House Goa 2026! 🌴 Check out my official builder badge (${config.builder.builderTitle || 'Builder'})!`
          : `Just updated my profile graphic for Hacker House Goa 2026! 🌴`;

        if (platform === 'x') {
          const tweetText = `${titleText}\\n\\nGet yours here:`;
          const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(data.shareUrl)}&hashtags=FrameInGoa,HHGoa2026`;
          window.open(tweetUrl, '_blank', 'noopener,noreferrer');
        } else if (platform === 'linkedin') {
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.shareUrl)}`;
          window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
        }

        try {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.5 },
          });
        } catch {}
      }
    } catch (err) {
      console.error(`Share to ${platform} error:`, err);
      const tweetText = `Pumped for Hacker House Goa 2026! 🌴 Check out my builder graphic! #FrameInGoa #HHGoa2026`;
      window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
    } finally {
      setIsSharing(null);
    }
  };

  const handleCopyShareLink = () => {
    if (!shareResult) return;
    navigator.clipboard.writeText(shareResult.shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Format B: 3D Flippable Card Stage */}
      {config.format === 'badge' ? (
        <div className="flex flex-col items-center gap-3 w-full">
          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full max-w-[380px] aspect-[12/18.6] cursor-pointer group select-none"
            style={{ perspective: '1200px' }}
          >
            <div
              className="relative w-full h-full duration-500 transition-transform rounded-2xl shadow-2xl"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT SIDE */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-[#071712] border border-[#d4af37]/30 shadow-2xl"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <canvas ref={frontCanvasRef} className="w-full h-full object-contain rounded-xl" />
              </div>

              {/* BACK SIDE */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-[#071712] border border-[#d4af37]/30 shadow-2xl"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <canvas ref={backCanvasRef} className="w-full h-full object-contain rounded-xl" />
              </div>
            </div>
          </div>

          {/* Side Download Switcher */}
          <div className="flex items-center gap-2 w-full max-w-[380px]">
            <button
              type="button"
              onClick={() => handleDownload('front')}
              className="flex-1 py-1.5 px-2 rounded-lg bg[#102d22] border border[#d4af37]/20 text[#f7eec8] text-xs font-semibold hover:border[#f3c85c] transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Download className="h-3 w-3 text[#f3c85c]" />
              <span>Front</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('back')}
              className="flex-1 py-1.5 px-2 rounded-lg bg[#102d22] border border[#d4af37]/20 text[#f7eec8] text-xs font-semibold hover:border[#f3c85c] transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Download className="h-3 w-3 text[#f3c85c]" />
              <span>Back</span>
            </button>
          </div>
        </div>
      ) : (
        /* Format A: PFP Square Frame Stage */
        <div className="relative w-full max-w-[400px] aspect-square rounded-2xl bg[#071712] border border[#d4af37]/30 shadow-2xl overflow-hidden">
          <canvas ref={frameCanvasRef} className="w-full h-full object-contain rounded-xl" />

          {!userImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg[#071712]/60 backdrop-blur-sm p-6 text-center">
              <Sparkles className="h-6 w-6 text[#f3c85c] mb-2" />
              <p className="font-bold text[#f7eec8] text-sm mb-1">
                Photo Recommended
              </p>
              <p className="text[#a2b8ad] text-xs max-w-xs">
                Upload your photo on the left panel to preview your graphic in real-time!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[380px]">
        {/* Share to X Button */}
        <button
          type="button"
          onClick={() => handleShare('x')}
          disabled={isSharing !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg[#0a151d]/60 border border[#d4af37]/20 hover:border[#f3c85c] px-3.5 py-2 font-semibold text[#f7eec8] text-xs transition-all cursor-pointer disabled:opacity-50"
        >
          {isSharing === 'x' ? (
            <Loader2 className="h-4 w-4 animate-spin text[#f3c85c]" />
          ) : (
            <Twitter className="h-4 w-4 text[#f3c85c]" />
          )}
          <span>Share</span>
        </button>

        {/* Primary Download Graphic Button */}
        <button
          type="button"
          onClick={() => handleDownload()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg[#f3c85c] hover:bg[#fbd881] text[#071712] px-3.5 py-2 font-bold text-xs transition-all cursor-pointer active:scale-95"
        >
          <Download className="h-4 w-4 stroke-[2.5]" />
          <span>Generate</span>
        </button>
      </div>

      {/* Share Result Dialog Modal */}
      {showShareModal && shareResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-[#d4af37]/20 bg[#071712] p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text[#a2b8ad] hover:text[#fff] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text[#f3c85c] font-bold text-lg">
              <Sparkles className="h-5 w-5" />
              <span>Graphic Ready!</span>
            </div>

            <p className="text[#a2b8ad] text-xs leading-relaxed">
              Your graphic is generated and hosted with Open Graph meta tags for social sharing.
            </p>

            {/* Generated Image Preview */}
            <div className="rounded-xl overflow-hidden border border[#d4af37]/20 max-h-48 flex justify-center bg[#030d09] p-2">
              <img src={shareResult.ogImageUrl} alt="Generated HH Goa Graphic" className="object-contain h-full rounded-lg" />
            </div>

            {/* Share URL Input Box */}
            <div className="space-y-1">
              <label className="text-[11px] text[#a2b8ad] uppercase font-semibold">Share URL</label>
              <div className="flex items-center gap-2 rounded-lg bg[#030d09] p-1.5 border border[#d4af37]/20">
                <input
                  type="text"
                  readOnly
                  value={shareResult.shareUrl}
                  className="w-full bg-transparent text-xs text[#f7eec8] px-2 focus:outline-none"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="rounded-md bg[#f3c85c]/20 px-3 py-1.5 text-xs font-bold text[#f3c85c] hover:bg[#f3c85c]/30 shrink-0 cursor-pointer"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent('Check out my official Hacker House Goa 2026 builder badge! 🌴🚀')}&url=${encodeURIComponent(shareResult.shareUrl)}&hashtags=FrameInGoa,HHGoa2026`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 py-2 font-bold text-white text-xs hover:opacity-90"
              >
                <Twitter className="h-4 w-4 fill-current" />
                <span>Post</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareResult.shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 py-2 font-bold text-white text-xs hover:opacity-90"
              >
                <Linkedin className="h-4 w-4 fill-current" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};