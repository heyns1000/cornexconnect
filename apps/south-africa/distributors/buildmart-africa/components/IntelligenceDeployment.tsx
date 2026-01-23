
import React from 'react';

interface IntelligenceDeploymentProps {
  onProjectAll: () => void;
}

export const IntelligenceDeployment: React.FC<IntelligenceDeploymentProps> = ({ onProjectAll }) => {
  return (
    <div className="bg-[#0b1424] rounded-[40px] p-10 lg:p-14 mb-12 shadow-2xl relative overflow-hidden border border-white/5">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <svg className="w-48 h-48" fill="white" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 italic">Intelligence Deployment</span>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">— Frequency Auditing...</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white leading-none mb-6">Project Demand Projection</h2>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest max-w-xl italic leading-relaxed">
            Automate procurement via historical "Probability of Purchase".<br/>
            <span className="text-emerald-500">Inactive models are strategically omitted to protect your capital.</span>
          </p>
        </div>
        
        <button 
          onClick={onProjectAll}
          className="control-lock bg-black text-white px-12 py-6 rounded-full font-black uppercase text-[12px] tracking-[0.1em] shadow-[0_0_30px_rgba(59,130,246,0.4)] border-2 border-[#3b82f6] transition-all hover:bg-zinc-900 active:scale-95 cursor-pointer flex items-center gap-4 relative z-20"
        >
          <svg className="w-5 h-5 text-[#3b82f6]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          Project Intelligent Order
        </button>
      </div>
    </div>
  );
};
