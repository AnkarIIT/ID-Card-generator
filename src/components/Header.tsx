import React from 'react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import logoImg from '../images/logo.jpg';

export const Header: React.FC = () => {
  return (
    <header className="relative z-10 border-b border-[#d4af37]/30 bg-[#071913]/95 backdrop-blur-md px-4 py-3.5 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Hacker House Goa Logo"
            className="h-11 w-11 rounded-xl border border-[#d4af37]/50 object-cover shadow-md"
          />
          <div className="flex items-center gap-2.5">
            <h1 className="font-extrabold text-base sm:text-lg text-[#f7eec8] tracking-wider font-mono">
              HACKER HOUSE GOA <span className="text-[#f3c85c]">2026</span>
            </h1>
            <span className="h-4 w-px bg-[#d4af37]/30 hidden sm:inline-block" />
            <span className="rounded-md bg-[#12362a] px-2.5 py-0.5 font-bold text-[#f3c85c] text-[11px] border border-[#d4af37]/30">
              OCT 28-31
            </span>
          </div>
        </div>

        {/* Location & Tagline Badge */}
        <div className="flex items-center gap-2.5 flex-wrap text-xs text-[#c9b99a]">
          <div className="flex items-center gap-1.5 rounded-full bg-[#0f2c22] px-3.5 py-1 border border-[#d4af37]/30 text-[#f7eec8]">
            <MapPin className="h-3.5 w-3.5 text-[#f3c85c]" />
            <span className="font-medium">Goa, India 🌴</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#0f2c22] px-3.5 py-1 border border-[#d4af37]/30 text-[#f7eec8]">
            <Calendar className="h-3.5 w-3.5 text-[#f3c85c]" />
            <span>Oct 28 – 31</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#f3c85c]/15 px-3.5 py-1 text-[#f3c85c] border border-[#f3c85c]/40 font-bold text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-[#f3c85c]" />
            <span>#FrameInGoa</span>
          </div>
        </div>
      </div>
    </header>
  );
};

