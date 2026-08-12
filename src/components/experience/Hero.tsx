import React from 'react';
import { motion } from 'motion/react';
import { GoaBeach } from './GoaBeach';

interface HeroProps {
  onEnter: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const HEADLINE = ['FRAME', 'YOUR', 'IDENTITY.'];

export const Hero: React.FC<HeroProps> = ({ onEnter }) => {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-[#050807]">
      {/* Beach */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <GoaBeach className="absolute inset-0 h-full w-full object-cover" />
      </motion.div>

      {/* vignette */}
      <div className="vignette absolute inset-0" />
      {/* deep color grade on top */}
      <div className="absolute inset-0 bg-[#050807]/35" />
      {/* CRT scanlines */}
      <div className="scanlines pointer-events-none absolute inset-0" />

      {/* sun glow pulse behind title */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[38%] h-[46vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255,170,90,0.28), rgba(255,120,80,0.08) 55%, transparent)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.9, ease: 'easeOut' }}
      />

      {/* top-left brand */}
      <motion.div
        className="absolute left-5 top-5 sm:left-8 sm:top-7 z-20 flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
      >
        <img
          src="/src/images/logo.jpg"
          alt="Hacker House Goa"
          className="h-10 w-10 object-cover"
        />
        <div className="hidden sm:block">
          <span className="block font-display text-lg leading-none text-[#f7eec8] glow-gold">
            Hacker House
          </span>
          <span className="mono-tag mt-1 block text-[#f3c85c]">Goa / 2026</span>
        </div>
      </motion.div>

      {/* top-right dates */}
      <motion.div
        className="absolute right-5 top-7 sm:right-8 z-20 text-right"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6, ease: 'easeOut' }}
      >
        <span className="mono-tag block text-[#f7eec8]">28 — 31 OCT</span>
        <span className="mono-tag text-[#a2b8ad]">Goa, India</span>
      </motion.div>

      {/* center content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.p
          className="mono-tag mb-4 text-[#f3c85c]"
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          animate={{ opacity: 1, letterSpacing: '0.22em' }}
          transition={{ delay: 1.4, duration: 0.9, ease: 'easeOut' }}
        >
          SYS / HHGOA26
        </motion.p>

        <motion.h1
          className="font-display text-[clamp(3rem,11vw,9rem)] leading-[0.95] text-[#f7eec8] glow-pink"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.8, ease: EASE }}
        >
          HACKER HOUSE
        </motion.h1>

        <motion.p
          className="font-display text-[clamp(2.4rem,8vw,6.5rem)] leading-none text-transparent"
          style={{
            WebkitTextStroke: '1.5px rgba(255,180,80,0.9)',
            textShadow: '0 0 30px rgba(255,150,70,0.35)',
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.85, duration: 0.8, ease: EASE }}
        >
          GOA 2026
        </motion.p>

        {/* word-by-word headline */}
        <div className="mt-7 flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1">
          {HEADLINE.map((word, i) => (
            <motion.span
              key={word}
              className="font-display text-[clamp(1.7rem,5.5vw,4rem)] leading-tight text-[#f7eec8] glow-gold"
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 2.2 + i * 0.18, duration: 0.6, ease: EASE }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.p
          className="mt-4 max-w-md text-sm text-[#a2b8ad] sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.9, duration: 0.7 }}
        >
          Build your Goa identity. Take it with you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.7, ease: EASE }}
          className="mt-9"
        >
          <button
            type="button"
            onClick={onEnter}
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-[#c8ff3d] px-9 py-3.5 font-display text-sm tracking-[0.18em] text-[#071712] shadow-[0_0_40px_rgba(200,255,61,0.4)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(200,255,61,0.55)] hover:brightness-105 active:scale-95 cursor-pointer"
          >
            <span>⚡</span>
            <span>START BUILDING</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        </motion.div>

        <motion.p
          className="mono-tag mt-6 text-[#a2b8ad]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.4, duration: 0.6 }}
        >
          NO LOGIN. NO BS.
        </motion.p>
      </div>

      {/* bottom retro grid transition */}
      <div className="retro-grid pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-[34vh] w-full opacity-70" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[6] h-28 bg-gradient-to-t from-[#050807] to-transparent" />

      {/* scroll hint */}
      <motion.button
        type="button"
        onClick={onEnter}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.8 }}
      >
        <span className="mono-tag text-[#a2b8ad] transition-colors hover:text-[#f3c85c]">
          SCROLL TO ENTER
        </span>
        <span className="flex h-8 w-5 items-start justify-center rounded-full border border-[#d4af37]/40 pt-1.5">
          <span className="scroll-hint-dot h-1.5 w-1 rounded-full bg-[#f3c85c]" />
        </span>
      </motion.button>
    </section>
  );
};
