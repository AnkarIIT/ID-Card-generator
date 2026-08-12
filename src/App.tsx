import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CardConfig, FormatType, CardSide, FrameStyle, ThemeStyle, PhotoTransform, BuilderData } from './types';
import { Hero } from './components/experience/Hero';
import { PhotoStep } from './components/experience/PhotoStep';
import { LoreStep } from './components/experience/LoreStep';
import { VibeStep } from './components/experience/VibeStep';
import { LiveCard } from './components/experience/LiveCard';
import { FinalOverlay } from './components/experience/FinalOverlay';
import { loadImage } from './utils/heicConverter';
import { ArrowDown, Rocket } from 'lucide-react';

const EMPTY_BUILDER: BuilderData = {
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
};

export default function App() {
  const [finalOpen, setFinalOpen] = useState(false);

  const [format] = useState<FormatType>('badge');
  const [side, setSide] = useState<CardSide>('both');
  const [themeStyle] = useState<ThemeStyle>('goa_vintage');
  const [frameStyle] = useState<FrameStyle>('sunset_wave');

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | undefined>(undefined);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);

  const [photoTransform, setPhotoTransform] = useState<PhotoTransform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    filter: 'none',
  });

  const [builder, setBuilder] = useState<BuilderData>(EMPTY_BUILDER);

  useEffect(() => {
    if (photoDataUrl) {
      loadImage(photoDataUrl)
        .then((img) => setUserImage(img))
        .catch((err) => console.error('Failed to load image element:', err));
    } else {
      setUserImage(null);
    }
  }, [photoDataUrl]);

  const handlePhotoLoaded = (url: string, name: string) => {
    setPhotoDataUrl(url);
    setPhotoName(name);
  };

  const handleClearPhoto = () => {
    setPhotoDataUrl(null);
    setPhotoName(undefined);
  };

  const handleCreateAnother = () => {
    setBuilder(EMPTY_BUILDER);
    setPhotoTransform({ x: 0, y: 0, scale: 1, rotation: 0, filter: 'none' });
    handleClearPhoto();
    setFinalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBuilder = () => {
    document.getElementById('builder-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cardConfig: CardConfig = {
    format,
    side,
    frameStyle,
    themeStyle,
    builder,
    photoTransform,
  };

  return (
    <div className="min-h-screen bg-[#050807] text-[#f7eec8] antialiased">
      {/* global film grain */}
      <div className="grain-overlay" aria-hidden />

      {/* ── 01 HERO ── */}
      <Hero onEnter={scrollToBuilder} />

      {/* ── 02 BUILDER ── */}
      <section id="builder-top" className="relative z-10 bg-[#050807]">
        {/* Soft edge fade that slides up with the builder */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-40 -translate-y-full bg-gradient-to-b from-transparent to-[#050807]" />
        {/* arrival band: the beach darkening into the UI */}
        <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden">
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <motion.p
              className="mono-tag text-[#f3c85c]"
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              whileInView={{ opacity: 1, letterSpacing: '0.22em' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              GOA IS ONNNNN!
            </motion.p>
            <motion.h2
              className="font-display mt-2 text-[clamp(2rem,7vw,4.5rem)] leading-none text-[#f7eec8] glow-gold"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              YOUR BUILDER IS READY
            </motion.h2>
            <motion.p
              className="mono-tag mt-3 flex items-center gap-2 text-[#a2b8ad]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f3c85c]" />
              BUILD STATUS: READY
            </motion.p>
            <motion.div
              className="absolute bottom-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <ArrowDown className="h-4 w-4 animate-bounce text-[#a2b8ad]" />
            </motion.div>
          </div>
        </div>

        {/* builder body */}
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-8">
          <div className="grid grid-cols-1 gap-10 pt-14 lg:grid-cols-12">
            {/* Left column — progressive steps */}
            <div className="space-y-16 lg:col-span-7">
              {/* STEP 01 — PHOTO */}
              <StepSection
                index="01"
                label="YOUR PHOTO"
                status={photoDataUrl ? 'DONE' : 'PENDING'}
                hint={photoDataUrl ? 'PIXELS INCOMING...' : 'THE FACE OF THE CARD'}
              >
                <PhotoStep
                  hasPhoto={!!photoDataUrl}
                  photoName={photoName}
                  photoDataUrl={photoDataUrl}
                  transform={photoTransform}
                  onChangeTransform={setPhotoTransform}
                  onPhotoLoaded={handlePhotoLoaded}
                  onClear={handleClearPhoto}
                />
              </StepSection>

              {/* STEP 02 — LORE */}
              <StepSection
                index="02"
                label="YOUR LORE"
                status={builder.name ? 'DONE' : 'PENDING'}
                hint="WHO ARE YOU IN GOA?"
              >
                <LoreStep builder={builder} onChangeBuilder={setBuilder} />
              </StepSection>

              {/* STEP 03 — VIBE */}
              <StepSection
                index="03"
                label="SET THE VIBE"
                status={photoTransform.filter !== 'none' ? 'DONE' : 'DEFAULT'}
                hint="COLOR THE WORLD"
              >
                <VibeStep
                  value={photoTransform.filter}
                  onChange={(filter) => setPhotoTransform({ ...photoTransform, filter })}
                  photoDataUrl={photoDataUrl}
                  hasPhoto={!!photoDataUrl}
                />
              </StepSection>

              {/* READY TO SHIP */}
              <section className="relative overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-gradient-to-br from-[#0b211a] via-[#071712] to-[#1a0d14] px-6 py-12 text-center">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 120%, rgba(255,92,138,0.16), transparent 60%)',
                  }}
                />
                <p className="mono-tag text-[#f3c85c]">CURRENTLY COOKING...</p>
                <h3 className="font-display mt-3 text-[clamp(1.8rem,5vw,3rem)] leading-none text-[#f7eec8] glow-pink">
                  READY TO SHIP?
                </h3>
                <p className="mono-tag mt-3 text-[#a2b8ad]">
                  {builder.name
                    ? `PIXELS LOOK GOOD ✓ · ${builder.name.toUpperCase()}`
                    : 'NAME OPTIONAL — SHIP ANYWAY'}
                </p>
                <motion.button
                  type="button"
                  onClick={() => setFinalOpen(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-7 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f3c85c] to-[#ffb26b] px-10 py-4 font-display text-base tracking-[0.18em] text-[#071712] shadow-[0_0_40px_rgba(243,200,92,0.35)] transition-shadow hover:shadow-[0_0_60px_rgba(255,92,138,0.4)] cursor-pointer"
                >
                  <Rocket className="h-5 w-5" />
                  BUILD MY ID →
                </motion.button>
                <p className="mono-tag mt-5 text-[#3f5a50]">404 — SLEEP NOT FOUND</p>
              </section>
            </div>

            {/* Right column — live card (sticky) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-10">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-display text-sm tracking-wider text-[#a2b8ad]">LIVE ID</span>
                  <span className="mono-tag text-[#3f5a50]">
                    {builder.name ? builder.name.toUpperCase() : ''}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {photoDataUrl ? (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, scale: 0.9, y: 24 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <LiveCard config={cardConfig} userImage={userImage} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="flex aspect-[12/18.6] w-full max-w-[330px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#d4af37]/25 bg-[#071712]/40 px-6 text-center"
                    >
                      <span className="font-display text-2xl text-[#3f5a50]">ID</span>
                      <p className="text-xs text-[#a2b8ad]">
                        your card assembles here
                        <br />
                        the moment you drop a photo
                      </p>
                      <span className="mono-tag text-[#3f5a50]">AWAITING INPUT...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="mono-tag mt-5 text-center text-[#3f5a50]">
                  CLICK CARD TO FLIP · FRONT / BACK
                </p>
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* ── 03 FOOTER ── */}
      <footer className="relative z-10 border-t border-[#d4af37]/20 bg-[#050807]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:px-8 sm:text-left">
          <span className="mono-tag text-[#a2b8ad]">
            SYS / HHGOA26
          </span>
          <span className="mono-tag text-[#a2b8ad]">
            Made with <span className="text-[#ff5c8a]">❤️</span> by{' '}
            <span className="text-[#f3c85c]">Baddie Detectors</span>
          </span>
          <span className="mono-tag text-[#3f5a50]">28 — 31 OCT · GOA, INDIA</span>
        </div>
      </footer>

      {/* ── 04 FINAL STAGE ── */}
      <AnimatePresence>
        {finalOpen && (
          <FinalOverlay
            key="final"
            config={cardConfig}
            userImage={userImage}
            onExit={() => setFinalOpen(false)}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface StepSectionProps {
  index: string;
  label: string;
  status: string;
  hint: string;
  children: React.ReactNode;
}

const StepSection: React.FC<StepSectionProps> = ({ index, label, status, hint, children }) => (
  <section>
    <div className="mb-5 flex items-end justify-between">
      <div className="flex items-baseline gap-4">
        <span
          className="font-display text-5xl text-transparent"
          style={{ WebkitTextStroke: '1.5px rgba(243,200,92,0.55)' }}
        >
          {index}
        </span>
        <div>
          <h3 className="font-display text-xl tracking-wider text-[#f7eec8]">{label}</h3>
          <p className="mono-tag mt-1 text-[#3f5a50]">{hint}</p>
        </div>
      </div>
      <span
        className={`mono-tag rounded-full border px-3 py-1 ${
          status === 'PENDING'
            ? 'border-[#d4af37]/25 text-[#3f5a50]'
            : 'border-[#f3c85c]/50 text-[#f3c85c]'
        }`}
      >
        {status}
      </span>
    </div>
    {children}
  </section>
);
