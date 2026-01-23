
import React from 'react';
import { exportOrderManifestToCSV } from '../utils/export.ts';
import { TierLevel, OrderSummary } from '../types.ts';

interface HeaderProps {
  onIntelligenceClick: () => void;
  onVaultClick: () => void;
  onRegistryClick: () => void;
  onAdGeneratorClick: () => void;
  onAssistClick: () => void;
  selectedTier: TierLevel;
  summary: OrderSummary;
  viewMode: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  onIntelligenceClick,
  onVaultClick,
  onRegistryClick,
  onAdGeneratorClick,
  onAssistClick,
  selectedTier, 
  summary,
  viewMode
}) => {
  const handleExportAndPrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!summary.activeItems || summary.activeItems.length === 0) {
      alert("COMMAND DENIED: Select items for registry audit first.");
      return;
    }
    
    // Industrial logic: Trigger CSV first
    exportOrderManifestToCSV(summary.activeItems, summary.totalValue);
    
    // Buffer for download initiation before blocking UI with print dialog
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const handlePrintPreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // System print dialog acts as the industrial preview hub
    window.print();
  };

  return (
    <header className="glass-header sticky top-0 z-[100] no-print border-b-4 border-[#004a99] py-4 bg-white/95 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onRegistryClick}>
          <div className="bg-[#004a99] p-2.5 rounded-2xl shadow-lg transition-all group-hover:rotate-12">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 34H36V37H4V34Z" fill="white"/>
              <path d="M6 34V10C6 8 8 6 12 6H28C32 6 34 8 34 12V34" stroke="white" strokeWidth="4"/>
            </svg>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-[#004a99] uppercase leading-none block">CornexConnect™</span>
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mt-1 block italic">Logistics Ecosystem v2.6</span>
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest">
          <button onClick={onRegistryClick} className={`transition-all ${viewMode === 'REGISTRY' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-900 hover:text-blue-600'}`}>Inventory Registry</button>
          <button onClick={onVaultClick} className={`transition-all ${viewMode === 'VAULT' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-900 hover:text-blue-600'}`}>Audit Vault</button>
          <button onClick={onIntelligenceClick} className={`transition-all ${viewMode === 'INTELLIGENCE' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-900 hover:text-blue-600'}`}>Intelligence Hub</button>
          <button onClick={onAdGeneratorClick} className={`transition-all ${viewMode === 'AD_GENERATOR' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-900 hover:text-blue-600'}`}>Creative Lab</button>
          <button onClick={onAssistClick} className="flex items-center gap-2 bg-[#004a99] text-white px-5 py-2.5 rounded-full hover:bg-blue-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl animate-pulse ring-4 ring-blue-600/10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Assist Node
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={handlePrintPreview} 
            className="bg-slate-50 text-slate-900 px-8 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all border border-slate-200 hover:bg-slate-200 active:scale-95 cursor-pointer flex items-center gap-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 9.073 7.317 6 12 6s8.601 3.073 9.964 5.678c.215.411.215.895 0 1.306C20.601 14.927 16.683 18 12 18s-8.601-3.073-9.964-5.678z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            PREVIEW
          </button>
          <button 
            type="button"
            onClick={handleExportAndPrint} 
            className="bg-black text-white px-10 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-4 border border-white/10 active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" />
            </svg>
            EXPORT & PRINT
          </button>
        </div>
      </div>
    </header>
  );
};
