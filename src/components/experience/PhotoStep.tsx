import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Loader2, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { processUploadedFile } from '../../utils/heicConverter';
import { PhotoAdjuster } from '../PhotoAdjuster';
import { PhotoTransform } from '../../types';

interface PhotoStepProps {
  hasPhoto: boolean;
  photoName?: string;
  photoDataUrl?: string | null;
  transform: PhotoTransform;
  onChangeTransform: (t: PhotoTransform) => void;
  onPhotoLoaded: (dataUrl: string, name: string) => void;
  onClear: () => void;
}

const DEMO_AVATARS = [
  {
    name: 'Tech Founder',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Developer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Designer',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
  },
];

export const PhotoStep: React.FC<PhotoStepProps> = ({
  hasPhoto,
  photoName,
  photoDataUrl,
  transform,
  onChangeTransform,
  onPhotoLoaded,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setErrorMsg(null);
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, HEIC, WEBP).');
      return;
    }
    try {
      setIsProcessing(true);
      const dataUrl = await processUploadedFile(file);
      onPhotoLoaded(dataUrl, file.name);
    } catch {
      setErrorMsg('Could not read image file. Try another photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      <AnimatePresence mode="wait">
        {!hasPhoto ? (
          <motion.div
            key="drop"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-[#f3c85c] bg-[#f3c85c]/10'
                : 'border-[#d4af37]/35 bg-[#071712]/40 hover:border-[#f3c85c]/70 hover:bg-[#0b211a]/40'
            }`}
          >
            {/* corner ticks */}
            <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[#f3c85c]/50" />
            <span className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[#f3c85c]/50" />
            <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#f3c85c]/50" />
            <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#f3c85c]/50" />

            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-9 w-9 animate-spin text-[#f3c85c]" />
                <span className="font-mono text-sm text-[#f7eec8]">CONVERTING...</span>
              </div>
            ) : (
              <>
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full border transition-all ${
                    isDragging
                      ? 'border-[#f3c85c] bg-[#f3c85c]/15'
                      : 'border-[#d4af37]/40 bg-[#071712] group-hover:border-[#f3c85c]'
                  }`}
                >
                  <Upload className="h-7 w-7 text-[#f3c85c]" />
                </div>
                <p className="mt-4 font-display text-lg tracking-wider text-[#f7eec8]">
                  DROP YOUR PHOTO
                </p>
                <p className="mt-1.5 text-sm text-[#a2b8ad]">
                  drag here, or{' '}
                  <span className="font-semibold text-[#f3c85c] underline underline-offset-4">
                    browse
                  </span>
                </p>
                <p className="mono-tag mt-4 text-[#3f5a50]">JPG · PNG · HEIC · WEBP</p>
              </>
            )}

            {errorMsg && (
              <div className="absolute bottom-4 flex items-center gap-2 rounded-lg bg-[#2a0d14] px-3 py-1.5 text-rose-400 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="loaded"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#d4af37]/35 bg-[#0b211a]/60 px-5 py-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3c85c]/15 border border-[#f3c85c]/40">
                <Check className="h-5 w-5 text-[#f3c85c]" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-xs font-bold tracking-wider text-[#f3c85c]">
                  ✓ PHOTO LOADED
                </p>
                <p className="truncate text-sm text-[#f7eec8]">
                  {photoName || 'photo.jpg'}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 px-4 py-2 font-mono text-xs font-semibold text-[#f7eec8] transition-all hover:border-[#f3c85c] hover:text-[#f3c85c] cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                CHANGE
              </button>
              <button
                type="button"
                onClick={onClear}
                className="rounded-full border border-transparent px-3 py-2 font-mono text-xs text-[#a2b8ad] transition-colors hover:text-[#e11d48] cursor-pointer"
              >
                CLEAR
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasPhoto && (
        <motion.div
          key="adjuster"
          className="mt-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <PhotoAdjuster
            transform={transform}
            onChangeTransform={onChangeTransform}
            photoDataUrl={photoDataUrl}
          />
        </motion.div>
      )}

      {/* demo samples */}
      {!hasPhoto && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mono-tag text-[#3f5a50]">SAMPLES:</span>
          {DEMO_AVATARS.map((demo) => (
            <button
              key={demo.name}
              type="button"
              onClick={() => onPhotoLoaded(demo.url, `${demo.name.toLowerCase().replace(/\s/g, '_')}.jpg`)}
              className="flex items-center gap-1.5 rounded-full border border-[#d4af37]/25 bg-[#071712]/60 px-2.5 py-1 text-[11px] font-medium text-[#c9b99a] transition-all hover:border-[#f3c85c] hover:text-[#f7eec8] cursor-pointer"
            >
              <img src={demo.url} alt={demo.name} className="h-4 w-4 rounded-full object-cover" />
              <span>{demo.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
