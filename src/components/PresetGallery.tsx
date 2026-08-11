import React from 'react';
import { BuilderData, ThemeStyle, FrameStyle } from '../types';
import { Sparkles, Zap, Flame, Shield } from 'lucide-react';

interface PresetGalleryProps {
  onApplyPreset: (
    builder: Partial<BuilderData>,
    theme: ThemeStyle,
    frame: FrameStyle
  ) => void;
}

const PRESETS = [
  {
    name: 'Goa Hacker',
    handle: 'goa_hacker',
    role: 'FULLSTACK BUILDER',
    stack: 'REACT • NODE • TAILWIND • TYPESCRIPT • COFFEE',
    builderTitle: 'PROFESSIONAL JUGAAD SPECIALIST',
    statusTag: 'VERIFIED BUILDER',
    photoMotto: 'MAKING HISTORY IN GOA.',
    currentlyBuilding: 'Cool stuff and awesome apps 🚀',
    sideQuest: 'STARTUPS • TRAVEL • BEACH • FOOD',
    sleepStatus: '404: NOT FOUND (KAAM > NEEND)',
    chaosLevel: 82,
    poweredBy: 'CHAI + JUGAAD',
    mostUsedKey: 'CTRL + Z',
    favouriteError: '404',
    hindiPunchline: 'करेंगे सबका, छापेंगे अलग!',
    theme: 'goa_vintage' as ThemeStyle,
    frame: 'sunset_wave' as FrameStyle,
    icon: Flame,
  },
  {
    name: 'Aarav Sharma',
    handle: 'aarav_sol',
    role: 'Smart Contract Lead',
    stack: 'Rust / Solana / ZK / Anchor',
    builderTitle: 'Solana ZK Alchemist',
    statusTag: 'VERIFIED BUILDER',
    photoMotto: 'COOKING IN SILENCE.',
    currentlyBuilding: 'Zero Knowledge Rollups',
    sideQuest: 'CHESS • COFFEE • DEFI',
    sleepStatus: '3 HOURS (COFFEE RUNNING)',
    chaosLevel: 65,
    poweredBy: 'RED BULL + RUST',
    mostUsedKey: 'CARGO BUILD',
    favouriteError: 'PANIC!',
    hindiPunchline: 'कोड लिखो, क्रांति लाओ!',
    theme: 'goa_sunset' as ThemeStyle,
    frame: 'sunset_wave' as FrameStyle,
    icon: Flame,
  },
  {
    name: 'Maya Patel',
    handle: 'maya_ai',
    role: 'AI Research Eng',
    stack: 'Python / Gemini / PyTorch',
    builderTitle: 'AI Agent Maestro',
    statusTag: 'HACKER PASS',
    photoMotto: 'BUILDING THE FUTURE',
    currentlyBuilding: 'Autonomous Agent Fleet',
    sideQuest: 'HACKATHONS • MUSIC',
    sleepStatus: 'OPTIMAL (GPU RUNNING)',
    chaosLevel: 90,
    poweredBy: 'MATCHA + GEMINI',
    mostUsedKey: 'GIT PUSH',
    favouriteError: 'OOM EXCEPTION',
    hindiPunchline: 'AI से दुनिया बदलेंगे!',
    theme: 'cyber_ocean' as ThemeStyle,
    frame: 'cyber_brackets' as FrameStyle,
    icon: Zap,
  },
  {
    name: 'Rohan Mehta',
    handle: 'rohan_defi',
    role: 'DeFi Architect',
    stack: 'Solidity / TypeScript',
    builderTitle: 'Goa Yield Architect',
    statusTag: 'SPEAKER',
    photoMotto: 'SHIPPING TODAY.',
    currentlyBuilding: 'Cross-chain Liquidity',
    sideQuest: 'SURFING • CRYPTO',
    sleepStatus: 'NEVER SLEEPS',
    chaosLevel: 95,
    poweredBy: 'GOA CHAI',
    mostUsedKey: 'CTRL + C',
    favouriteError: 'REVERT',
    hindiPunchline: 'बवाल मचाएंगे गोवा में!',
    theme: 'obsidian_gold' as ThemeStyle,
    frame: 'gold_laurel' as FrameStyle,
    icon: Shield,
  },
];

export const PresetGallery: React.FC<PresetGalleryProps> = ({ onApplyPreset }) => {
  return (
    <div className="w-full space-y-2 pt-2 border-t border-zinc-800">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Quick Preset Profiles</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESETS.map((p, idx) => {
          const IconComp = p.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() =>
                onApplyPreset(
                  {
                    name: p.name,
                    handle: p.handle,
                    role: p.role,
                    stack: p.stack,
                    builderTitle: p.builderTitle,
                    statusTag: p.statusTag,
                    photoMotto: p.photoMotto,
                    currentlyBuilding: p.currentlyBuilding,
                    sideQuest: p.sideQuest,
                    sleepStatus: p.sleepStatus,
                    chaosLevel: p.chaosLevel,
                    poweredBy: p.poweredBy,
                    mostUsedKey: p.mostUsedKey,
                    favouriteError: p.favouriteError,
                    hindiPunchline: p.hindiPunchline,
                    qrUrl: `https://x.com/${p.handle}`,
                  },
                  p.theme,
                  p.frame
                )
              }
              className="flex flex-col items-start p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full mb-0.5">
                <span className="font-semibold text-zinc-200 text-xs truncate">{p.name}</span>
                <IconComp className="h-3 w-3 text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0" />
              </div>
              <span className="text-[10px] text-amber-400 font-mono font-medium truncate w-full">
                @{p.handle}
              </span>
              <span className="text-[10px] text-zinc-400 truncate w-full mt-0.5">
                {p.builderTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

