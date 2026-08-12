import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CardConfig, SavedShareResult } from '../../types';
import { renderGraphicOnCanvas } from '../../utils/canvasRenderer';
import confetti from 'canvas-confetti';
import {
  Download,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Loader2,
  X,
  RefreshCw,
} from 'lucide-react';

interface FinalOverlayProps {
  config: CardConfig;
  userImage: HTMLImageElement | null;
  onExit: () => void;
  onCreateAnother: () => void;
}

export const FinalOverlay: React.FC<FinalOverlayProps> = ({ config, userImage, onExit, onCreateAnother }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [isSharing, setIsSharing] = useState<string | null>(null);
  const [shareResult, setShareResult] = useState<SavedShareResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      renderGraphicOnCanvas(canvasRef.current, { ...config, side }, userImage);
    }
  }, [config, userImage, side]);

  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#f3c85c', '#ff5c8a', '#4de2ff', '#ffb26b'],
      });
    } catch {}
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    const safeName = (config.builder.name || 'Builder').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `HH_Goa_2026_Badge_${side === 'front' ? 'Front' : 'Back'}_${safeName}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async (platform: 'x' | 'linkedin') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      setIsSharing(platform);
      const imageDataUrl = canvas.toDataURL('image/png', 0.92);
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'badge',
          name: config.builder.name,
          role: config.builder.role,
          stack: config.builder.stack,
          builderTitle: config.builder.builderTitle,
          imageDataUrl,
        }),
      });
      const data = await res.json();
      if (data.success && data.shareUrl) {
        setShareResult(data);
        const titleText = `Pumped to be building at Hacker House Goa 2026! 🌴 Check out my official builder badge (${config.builder.builderTitle || 'Builder'})!`;
        if (platform === 'x') {
          const tweetText = `${titleText}\\n\\nGet yours here:`;
          const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(data.shareUrl)}&hashtags=FrameInGoa,HHGoa2026`;
          window.open(tweetUrl, '_blank', 'noopener,noreferrer');
        } else {
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.shareUrl)}`;
          window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } catch {
      const tweetText = `Pumped for Hacker House Goa 2026! 🌴 Check out my builder graphic! #FrameInGoa #HHGoa2026`;
      window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
    } finally {
      setIsSharing(null);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* dark backdrop with warm glow */}
      <div className="absolute inset-0 bg-[#050807]/97" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 42%, rgba(255,120,80,0.14), rgba(243,200,92,0.06) 40%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* status bar */}
        <motion.div
          className="mono-tag mb-5 flex w-full items-center justify-between text-[#3f5a50]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span>SYS / HHGOA26</span>
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1 text-[#a2b8ad] transition-colors hover:text-[#f7eec8] cursor-pointer"
          >
            <X className="h-4 w-4" /> EXIT
          </button>
        </motion.div>

        {/* the card */}
        <motion.div
          className="card-glow relative w-full max-w-[300px]"
          initial={{ scale: 0.72, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.15 }}
        >
          <div className="relative aspect-[12/18.6] w-full overflow-hidden rounded-2xl border border-[#d4af37]/50 shadow-2xl">
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>
        </motion.div>

        {/* headline */}
        <motion.h2
          className="font-display mt-8 text-center text-[clamp(1.6rem,5vw,2.6rem)] leading-tight text-[#f7eec8] glow-gold"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          YOUR ID IS
          <br />
          FRAME-READY.
        </motion.h2>
        <motion.p
          className="mono-tag mt-2 text-[#3f5a50]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          PIXELS LOOK GOOD ✓
        </motion.p>

        {/* actions */}
        <motion.div
          className="mt-7 grid w-full grid-cols-2 gap-2.5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f3c85c] px-4 py-3 font-display text-sm tracking-wider text-[#071712] transition-all hover:bg-[#fbd881] hover:shadow-[0_0_30px_rgba(243,200,92,0.4)] active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            DOWNLOAD
          </button>
          <button
            type="button"
            onClick={() => handleShare('x')}
            disabled={isSharing !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/40 bg-[#0b211a]/60 px-4 py-3 font-display text-sm tracking-wider text-[#f7eec8] transition-all hover:border-[#4de2ff] hover:text-[#4de2ff] disabled:opacity-50 cursor-pointer"
          >
            {isSharing === 'x' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Twitter className="h-4 w-4" />
            )}
            SHARE TO X
          </button>
          <button
            type="button"
            onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/25 bg-[#071712] px-4 py-3 font-display text-xs tracking-wider text-[#a2b8ad] transition-all hover:border-[#f3c85c] hover:text-[#f7eec8] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {side === 'front' ? 'SHOW BACK' : 'SHOW FRONT'}
          </button>
          <button
            type="button"
            onClick={onCreateAnother}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/25 bg-[#071712] px-4 py-3 font-display text-xs tracking-wider text-[#a2b8ad] transition-all hover:border-[#f3c85c] hover:text-[#f7eec8] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            CREATE ANOTHER
          </button>
        </motion.div>

        <motion.p
          className="mono-tag mt-6 text-[#3f5a50]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          #FRAMEINGOA · HHGOA26
        </motion.p>
      </div>

      {/* share modal */}
      {shareResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-[#d4af37]/25 bg-[#071712] p-6 shadow-2xl">
            <button
              onClick={() => setShareResult(null)}
              className="absolute right-4 top-4 text-[#a2b8ad] transition-colors hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="font-display text-lg tracking-wide text-[#f3c85c]">GRAPHIC READY!</p>
            <p className="mt-1 text-xs leading-relaxed text-[#a2b8ad]">
              Your badge is hosted with Open Graph meta tags for social sharing.
            </p>
            <div className="mt-3 flex justify-center overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#030d09] p-2">
              <img
                src={shareResult.ogImageUrl}
                alt="Generated HH Goa Badge"
                className="max-h-48 rounded-lg object-contain"
              />
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#d4af37]/20 bg-[#030d09] p-1.5">
              <input
                type="text"
                readOnly
                value={shareResult.shareUrl}
                className="w-full bg-transparent px-2 font-mono text-xs text-[#f7eec8] focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareResult.shareUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="flex shrink-0 items-center gap-1 rounded-md bg-[#f3c85c]/20 px-3 py-1.5 text-xs font-bold text-[#f3c85c] hover:bg-[#f3c85c]/30 cursor-pointer"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent('Check out my official Hacker House Goa 2026 builder badge! 🌴🚀')}&url=${encodeURIComponent(shareResult.shareUrl)}&hashtags=FrameInGoa,HHGoa2026`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 py-2 font-bold text-xs text-white hover:opacity-90"
              >
                <Twitter className="h-4 w-4 fill-current" /> Post
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareResult.shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 py-2 font-bold text-xs text-white hover:opacity-90"
              >
                <Linkedin className="h-4 w-4 fill-current" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
