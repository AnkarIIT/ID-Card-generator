import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="relative z-10 border-b border-[#d4af37]/20 bg-[#050807]/95 backdrop-blur-md px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand - Minimal */}
        <div className="flex items-center gap-3">
          <img
            src="/src/images/logo.jpg"
            alt="Hacker House Goa"
            className="h-8 w-8 object-cover sm:h-9 sm:w-9"
          />
          <div className="hidden sm:block">
            <span className="text-[10px] text-[#a2b8ad] font-mono uppercase tracking-wider mb-0.5">
              Hacker House
            </span>
            <div className="flex items-center gap-2 text-[11px] text-[#f3c85c]">
              <span>GOA</span>
              <span className="text-[#a2b8ad]">/</span>
              <span>INDIA</span>
            </div>
          </div>
        </div>

        {/* Technical Info Strip */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-[#a2b8ad]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#f3c85c]">OCT 28-31</span>
          </div>
          <div className="h-3 w-px bg-[#d4af37]/30" />
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-[#f3c85c] hover:text-[#f7eec8] transition-colors">
            #FrameInGoa
          </a>
        </div>
      </div>
    </header>
  );
};