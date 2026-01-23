
import React from 'react';
import { TierLevel } from '../types.ts';
import { TIER_CONFIGS } from '../constants.tsx';

interface TierSelectionProps {
  selectedTier: TierLevel;
  onSelect: (tier: TierLevel) => void;
  hasSelections: boolean;
  onProjectAll: () => void;
}

export const TierSelection: React.FC<TierSelectionProps> = ({ selectedTier, onSelect, hasSelections, onProjectAll }) => {
  return (
    <section className="mb-12 no-print bg-slate-50 p-8 lg:p-12 rounded-[40px] border-2 border-slate-200 transition-all duration-500 relative">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#004a99] text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            Step 1: Authorization Selection
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1a1a1a] uppercase tracking-tighter italic leading-none">Price & MOQ Logic Gates</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            type="button"
            onClick={onProjectAll}
            className="control-lock bg-black text-white px-12 py-6 rounded-full font-black text-[12px] uppercase tracking-[0.1em] shadow-[0_0_30px_rgba(59,130,246,0.4)] border-2 border-[#3b82f6] transition-all hover:bg-zinc-900 active:scale-95 cursor-pointer relative z-20"
          >
            TRIGGER GLOBAL INTEL PROJECTION
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {TIER_CONFIGS.map(tier => {
          const isActive = selectedTier === tier.id;
          const isLocked = isActive && hasSelections;
          
          return (
            <div 
              key={tier.id}
              onClick={() => onSelect(tier.id as TierLevel)}
              className={`tier-card cursor-pointer transition-all duration-500 p-10 rounded-[32px] border-2 bg-white relative overflow-hidden ${
                isLocked
                  ? 'border-[#004a99] bg-blue-50 shadow-2xl ring-8 ring-blue-600/5'
                  : isActive 
                    ? 'border-blue-500 bg-blue-50/30 shadow-2xl' 
                    : hasSelections 
                      ? 'border-slate-100 opacity-40 grayscale pointer-events-none' 
                      : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className={`text-[12px] font-black uppercase tracking-widest block ${
                  tier.id === 1 ? 'text-blue-600' : tier.id === 2 ? 'text-indigo-600' : 'text-slate-500'
                }`}>
                  {tier.label}
                </span>
                {isActive && (
                   <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                )}
              </div>
              
              <p className="text-[11px] text-slate-400 font-black uppercase mb-6 italic leading-tight relative z-10">
                {tier.requirement}
              </p>
              
              <div className="flex items-baseline gap-1 relative z-10">
                <span className="text-slate-400 text-lg font-bold">R</span>
                <div className="text-5xl font-black text-slate-900 tracking-tighter italic">
                  {tier.id === 1 ? '9.72' : tier.id === 2 ? '12.06' : '15.08'}
                </div>
              </div>

              {isActive && (
                <div className="mt-8 pt-8 border-t border-blue-100 relative z-10">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">ACTIVE PROFILE PROFILE VERIFIED</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
