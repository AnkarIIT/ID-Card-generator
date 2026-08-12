import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { processUploadedFile } from '../utils/heicConverter';

interface PhotoUploaderProps {
  onPhotoLoaded: (dataUrl: string) => void;
  hasPhoto: boolean;
}

// Sample demo avatars for quick testing
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

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onPhotoLoaded,
  hasPhoto,
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
      onPhotoLoaded(dataUrl);
    } catch (err: any) {
      console.error('File load error:', err);
      setErrorMsg('Could not read image file. Try another photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-2.5 rounded-xl border border-dashed border-[#d4af37]/30 bg-[#071712]/40 p-4 text-center">
      <label className="font-mono text-[11px] font-semibold text-[#f3c85c] tracking-wider uppercase mb-2.5 block">
        01 / Photo
      </label>

      {/* Main Upload Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-xl border p-4 transition-all duration-150 cursor-pointer ${
          isDragging
            ? 'border-[#f3c85c] bg-[#f3c85c]/10'
            : hasPhoto
            ? 'border-[#d4af37]/40 bg-[#0c221a]/60 hover:border-[#d4af37]'
            : 'border-[#d4af37]/30 bg-[#071712]/40 hover:border-[#d4af37]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#f3c85c]" />
            <span className="font-medium text-[#f7eec8] text-xs">Processing &amp; converting...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#071712] border border-[#d4af37]/30 text-[#f3c85c] group-hover:border-[#f3c85c] transition-colors shrink-0">
              {hasPhoto ? <ImageIcon className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            </div>
            <div className="text-left">
              <p className="font-semibold text-[#f7eec8] text-xs">
                {hasPhoto ? '✓ Uploaded' : 'Drop your photo'}
              </p>
              <p className="text-[#a2b8ad] text-[11px]">
                JPG, PNG, HEIC, WEBP
              </p>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-rose-400 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preset Demo Avatars */}
      {!hasPhoto && (
        <div className="pt-0.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[#a2b8ad] text-[11px] shrink-0">samples:</span>
            {DEMO_AVATARS.map((demo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onPhotoLoaded(demo.url)}
                className="flex items-center gap-1.5 rounded-lg bg-[#071712] px-2.5 py-1 border border-[#d4af37]/30 hover:border-[#f3c85c] transition-all text-[11px] font-medium text-[#f7eec8] shrink-0 cursor-pointer"
              >
                <img src={demo.url} alt={demo.name} className="h-4 w-4 rounded-full object-cover" />
                <span>{demo.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};