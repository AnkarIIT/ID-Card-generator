import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Briefcase, Code2, Rocket, Compass, ChevronDown, Sparkles, Tag, AtSign, Flame, Moon } from 'lucide-react';
import { BuilderData } from '../../types';
import { extractXHandle } from '../../utils/urlUtils';

interface LoreStepProps {
  builder: BuilderData;
  onChangeBuilder: (b: BuilderData) => void;
}

const STATUS_TAGS = [
  'VERIFIED BUILDER',
  'ATTENDING',
  'HACKER PASS',
  'SPEAKER',
  'WEB3 NATIVE',
  'VIP PASS',
];

interface LoreFieldProps {
  icon: React.ReactNode;
  label: string;
  index: number;
  children: React.ReactNode;
}

const LoreField: React.FC<LoreFieldProps> = ({ icon, label, index, children }) => (
  <motion.div
    className="lore-field relative pb-1"
    initial={{ opacity: 0, y: 22 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    <label className="mono-tag mb-1 flex items-center gap-2 text-[#a2b8ad]">
      <span className="text-[#f3c85c]">{icon}</span>
      {label}
    </label>
    {children}
    <span className="lore-line" />
  </motion.div>
);

export const LoreStep: React.FC<LoreStepProps> = ({ builder, onChangeBuilder }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const set = (patch: Partial<BuilderData>) => onChangeBuilder({ ...builder, ...patch });

  return (
    <div className="w-full">
      <div className="space-y-7">
        <LoreField icon={<User className="h-3.5 w-3.5" />} label="NAME / ALIAS" index={0}>
          <input
            className="lore-input"
            value={builder.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. Bauna Kumar"
          />
        </LoreField>

        <LoreField icon={<Briefcase className="h-3.5 w-3.5" />} label="ROLE" index={1}>
          <input
            className="lore-input"
            value={builder.role}
            onChange={(e) => set({ role: e.target.value })}
            placeholder="e.g. Creative Technologist"
          />
        </LoreField>

        <LoreField icon={<Code2 className="h-3.5 w-3.5" />} label="STACK" index={2}>
          <input
            className="lore-input"
            value={builder.stack}
            onChange={(e) => set({ stack: e.target.value })}
            placeholder="e.g. React · TS · Python · AI"
          />
        </LoreField>

        <LoreField icon={<Rocket className="h-3.5 w-3.5" />} label="CURRENTLY BUILDING" index={3}>
          <input
            className="lore-input"
            value={builder.currentlyBuilding}
            onChange={(e) => set({ currentlyBuilding: e.target.value })}
            placeholder="e.g. Awesome Next.js app"
          />
        </LoreField>

        <LoreField icon={<Compass className="h-3.5 w-3.5" />} label="SIDE QUEST" index={4}>
          <input
            className="lore-input"
            value={builder.sideQuest}
            onChange={(e) => set({ sideQuest: e.target.value })}
            placeholder="e.g. Startups · Travel · Anime"
          />
        </LoreField>
      </div>

      {/* advanced / card detail fields */}
      <div className="mt-8 border-t border-[#d4af37]/15 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          className="mono-tag flex w-full items-center justify-between text-[#a2b8ad] transition-colors hover:text-[#f3c85c] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            MORE CARD DETAILS
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
          />
        </button>

        {showAdvanced && (
          <motion.div
            className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
          >
            <div className="lore-field relative">
              <label className="mono-tag mb-1 flex items-center gap-2 text-[#a2b8ad]">
                <AtSign className="h-3.5 w-3.5 text-[#f3c85c]" />X HANDLE
              </label>
              <input
                className="lore-input"
                value={builder.handle ? extractXHandle(builder.handle) : ''}
                onChange={(e) => {
                  const cleaned = extractXHandle(e.target.value);
                  set({ handle: cleaned, qrUrl: cleaned ? `https://x.com/${cleaned}` : '' });
                }}
                placeholder="shashwat_kumar"
              />
              <span className="lore-line" />
            </div>

            <div className="lore-field relative">
              <label className="mono-tag mb-1 flex items-center gap-2 text-[#a2b8ad]">
                <Sparkles className="h-3.5 w-3.5 text-[#f3c85c]" />BUILDER TITLE
              </label>
              <input
                className="lore-input"
                value={builder.builderTitle}
                onChange={(e) => set({ builderTitle: e.target.value })}
                placeholder="e.g. Professional Jugaad Specialist"
              />
              <span className="lore-line" />
            </div>

            <div className="lore-field relative">
              <label className="mono-tag mb-1 flex items-center gap-2 text-[#a2b8ad]">
                <Moon className="h-3.5 w-3.5 text-[#f3c85c]" />SLEEP STATUS
              </label>
              <input
                className="lore-input"
                value={builder.sleepStatus}
                onChange={(e) => set({ sleepStatus: e.target.value })}
                placeholder="e.g. 404 — sleep not found"
              />
              <span className="lore-line" />
            </div>

            <div className="lore-field relative">
              <label className="mono-tag mb-1 flex items-center gap-2 text-[#a2b8ad]">
                <Flame className="h-3.5 w-3.5 text-[#f3c85c]" />POWERED BY
              </label>
              <input
                className="lore-input"
                value={builder.poweredBy}
                onChange={(e) => set({ poweredBy: e.target.value })}
                placeholder="e.g. Chai + Jugaad + Questionable Decisions"
              />
              <span className="lore-line" />
            </div>

            <div className="lore-field relative">
              <label className="mono-tag mb-1 flex items-center gap-2 text-[#a2b8ad]">
                <Tag className="h-3.5 w-3.5 text-[#f3c85c]" />STATUS BADGE
              </label>
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                {STATUS_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => set({ statusTag: tag })}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all cursor-pointer border ${
                      builder.statusTag === tag
                        ? 'bg-[#f3c85c] text-[#071712] border-[#f3c85c] font-bold'
                        : 'bg-[#071712] border-[#d4af37]/25 text-[#c9b99a] hover:text-[#f7eec8] hover:border-[#d4af37]/50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <span className="lore-line" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
