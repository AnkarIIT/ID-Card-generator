import React, { useState, useEffect } from 'react';
import { CardConfig, FormatType, CardSide, FrameStyle, ThemeStyle, PhotoTransform, BuilderData } from './types';
import { Header } from './components/Header';
import { FormatSelector } from './components/FormatSelector';
import { PhotoUploader } from './components/PhotoUploader';
import { PhotoAdjuster } from './components/PhotoAdjuster';
import { BadgeForm } from './components/BadgeForm';
import { ThemeAndStylePicker } from './components/ThemeAndStylePicker';
import { GraphicPreview } from './components/GraphicPreview';
import { PresetGallery } from './components/PresetGallery';
import { loadImage } from './utils/heicConverter';
import { SlidersHorizontal, Eye, Download } from 'lucide-react';

export default function App() {
  // App State Configuration
  const [format, setFormat] = useState<FormatType>('badge');
  const [side, setSide] = useState<CardSide>('both');
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>('goa_vintage');
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('sunset_wave');

  // Mobile Tab State ('editor' or 'preview')
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Photo state
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);

  // Photo transform controls
  const [photoTransform, setPhotoTransform] = useState<PhotoTransform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    filter: 'none',
  });

  // Builder data fields initialized to empty strings so user can enter custom details
  const [builder, setBuilder] = useState<BuilderData>({
    name: '',
    handle: '',
    role: '',
    stack: '',
    builderTitle: '',
    statusTag: 'VERIFIED BUILDER',
    qrUrl: '',
    photoMotto: '',
    currentlyBuilding: '',
    sideQuest: '',
    sleepStatus: '',
    chaosLevel: 80,
    poweredBy: '',
    mostUsedKey: '',
    favouriteError: '',
    hindiPunchline: '',
    backHeadline: '',
  });

  // Load photo element asynchronously whenever photoDataUrl changes
  useEffect(() => {
    if (photoDataUrl) {
      loadImage(photoDataUrl)
        .then((img) => setUserImage(img))
        .catch((err) => console.error('Failed to load image element:', err));
    } else {
      setUserImage(null);
    }
  }, [photoDataUrl]);

  // Load default initial photo on mount
  useEffect(() => {
    const defaultPhoto = '';
    setPhotoDataUrl(defaultPhoto);
  }, []);

  const cardConfig: CardConfig = {
    format,
    side,
    frameStyle,
    themeStyle,
    builder,
    photoTransform,
  };

  const handleApplyPreset = (
    presetBuilder: Partial<BuilderData>,
    presetTheme: ThemeStyle,
    presetFrame: FrameStyle
  ) => {
    setBuilder((prev) => ({ ...prev, ...presetBuilder }));
    setThemeStyle(presetTheme);
    setFrameStyle(presetFrame);
  };

  return (
    <div className="min-h-screen bg-[#071712] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#133b2e] via-[#071712] to-[#030c09] text-[#f7eec8] font-sans selection:bg-[#f3c85c] selection:text-[#071712] flex flex-col pb-16 lg:pb-0">
      {/* Navbar Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-8 py-4 sm:py-5 space-y-4 sm:space-y-5">
        {/* Mobile Navigation Segmented Switcher (< lg) */}
        <div className="lg:hidden flex rounded-xl bg-[#0b211a] p-1 border border-[#d4af37]/30 sticky top-2 z-30 shadow-lg">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'editor'
                ? 'bg-[#153a2d] text-[#f3c85c] shadow-sm border border-[#d4af37]/40 font-bold'
                : 'text-[#a2b8ad] hover:text-[#f7eec8]'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Customize Details</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-[#153a2d] text-[#f3c85c] shadow-sm border border-[#d4af37]/40 font-bold'
                : 'text-[#a2b8ad] hover:text-[#f7eec8]'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>View Graphic Canvas</span>
          </button>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Controls Column (Left) */}
          <div className={`lg:col-span-6 space-y-4 sm:space-y-5 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            {/* Format & Side Selector */}
            <FormatSelector
              currentFormat={format}
              currentSide={side}
              onSelectFormat={setFormat}
              onSelectSide={setSide}
            />

            {/* Photo Uploader */}
            <PhotoUploader
              onPhotoLoaded={(url) => setPhotoDataUrl(url)}
              hasPhoto={!!photoDataUrl}
            />

            {/* Photo Adjuster */}
            {photoDataUrl && (
              <PhotoAdjuster
                transform={photoTransform}
                onChangeTransform={setPhotoTransform}
                photoDataUrl={photoDataUrl}
              />
            )}

            {/* Builder Data Form */}
            <BadgeForm
              builder={builder}
              onChangeBuilder={setBuilder}
              isBadgeFormat={format === 'badge'}
            />
          </div>

          {/* Canvas Live Preview Column (Right) */}
          <div className={`lg:col-span-6 lg:sticky lg:top-6 space-y-4 flex flex-col items-center ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="w-full bg-[#0c221a]/90 backdrop-blur-md rounded-2xl border border-[#d4af37]/30 p-3.5 sm:p-5 shadow-xl flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-[#d4af37]/20">
                <div className="flex items-center gap-2 font-semibold text-[#f3c85c] text-xs uppercase tracking-wider">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Goa Live Canvas Preview</span>
                </div>
                <span className="text-[11px] font-mono text-[#a2b8ad]">1200 x 1200 px</span>
              </div>

              {/* Graphic Canvas Display */}
              <GraphicPreview
                config={cardConfig}
                userImage={userImage}
                onRefreshPhoto={() => setPhotoDataUrl(null)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Navigation Bar for Mobile (< lg) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 flex items-center justify-between gap-2 p-2 bg-[#091d17]/95 backdrop-blur-md rounded-2xl border border-[#d4af37]/40 shadow-2xl">
        <button
          type="button"
          onClick={() => setMobileTab(mobileTab === 'editor' ? 'preview' : 'editor')}
          className="flex-1 py-2 px-3 rounded-xl bg-[#14362b] border border-[#d4af37]/30 text-[#f7eec8] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
        >
          {mobileTab === 'editor' ? (
            <>
              <Eye className="h-4 w-4 text-[#f3c85c]" />
              <span>See Live Preview</span>
            </>
          ) : (
            <>
              <SlidersHorizontal className="h-4 w-4 text-[#f3c85c]" />
              <span>Edit Details</span>
            </>
          )}
        </button>

        {mobileTab === 'editor' && (
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className="flex-1 py-2 px-3 rounded-xl bg-[#f3c85c] text-[#071712] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>Download PNG</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#d4af37]/20 bg-[#040e0b] py-4 text-center text-xs text-[#a2b8ad]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-[11px] text-[#a2b8ad]">
            Built for <span className="text-[#f3c85c] font-semibold">Hacker House Goa 2026 Shortlisting Task</span> • #FrameInGoa
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[#c9b99a] font-medium">
            <span>Deadline: Aug 13, 2026</span>
            <span>•</span>
            <a href="https://forms.gle/jM5hTaGvsrfEfixPA" target="_blank" rel="noreferrer" className="text-[#f3c85c] font-bold hover:underline">
              Submit Form 🌴
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
