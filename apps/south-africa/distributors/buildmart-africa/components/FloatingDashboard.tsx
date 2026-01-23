
import React from 'react';
import { OrderSummary } from '../types.ts';
import { exportOrderManifestToCSV } from '../utils/export.ts';

interface FloatingDashboardProps {
  summary: OrderSummary;
  onComplianceToggle: () => void;
  onReset: () => void;
  onSaveDraft: () => void;
  onCommit: () => void;
}

export const FloatingDashboard: React.FC<FloatingDashboardProps> = ({ summary, onComplianceToggle, onReset, onSaveDraft, onCommit }) => {
  const isVisible = summary.totalBoxes > 0;

  const handlePrintSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!summary.activeItems || summary.activeItems.length === 0) {
      alert("COMMAND DENIED: Select items for audit registry first.");
      return;
    }
    
    // Industrial manifest generation
    exportOrderManifestToCSV(summary.activeItems, summary.totalValue);
    
    // Buffered print dialog trigger
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSaveDraft();
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReset();
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 no-print transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) z-[200] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="max-w-[1440px] mx-auto px-8 py-6 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-10 lg:gap-16">
          <div className="border-r-2 border-slate-100 pr-10">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Review Selection</p>
            <p className="text-4xl lg:text-5xl font-black text-[#004a99] italic tracking-tighter leading-none mb-1">
              {summary.totalBoxes} <span className="text-2xl text-slate-400 font-black tracking-normal uppercase">Boxes</span>
            </p>
            <div className="flex gap-4">
              <p className="text-[9px] font-black text-slate-500 italic uppercase"><span className="text-slate-900">{summary.totalPieces.toLocaleString()}</span> Pieces</p>
              <p className="text-[9px] font-black text-slate-500 italic uppercase"><span className="text-slate-900">{summary.totalPacks.toLocaleString()}</span> Packs</p>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Gross Valuation</p>
            <p className="text-4xl lg:text-5xl font-black text-[#001f3f] italic leading-none tracking-tighter">
              R {summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-6 w-full lg:w-auto">
          <div className="text-center border-x-2 border-slate-100 px-8 hidden lg:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Authorization Gate</p>
            <div className={`text-2xl lg:text-3xl font-black italic uppercase tracking-tighter leading-none ${
              summary.isAuthorized ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              {summary.isAuthorized ? 'AUTHORIZED' : 'LOCKED'}
            </div>
            <p className="text-[8px] font-black text-slate-400 mt-1 uppercase">Profile Compliance Check</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Action Group 1: Utilities */}
            <div className="flex items-center gap-2 mr-2">
              <button 
                type="button"
                onClick={handlePreview}
                className="bg-slate-100 text-slate-600 px-6 py-4 rounded-xl font-black text-[10px] uppercase border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 9.073 7.317 6 12 6s8.601 3.073 9.964 5.678c.215.411.215.895 0 1.306C20.601 14.927 16.683 18 12 18s-8.601-3.073-9.964-5.678z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Preview
              </button>
              <button 
                type="button"
                onClick={handleSave}
                className="bg-blue-50 text-blue-600 px-6 py-4 rounded-xl font-black text-[10px] uppercase border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 002-2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                Draft
              </button>
            </div>

            {/* Action Group 2: Commitments */}
            <button 
              type="button"
              onClick={handlePrintSelection}
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase hover:bg-black transition-all flex items-center gap-3 shadow-xl active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4" /></svg>
              Print Selection
            </button>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onComplianceToggle(); }}
              className="bg-white text-blue-600 px-6 py-4 rounded-xl font-black text-[10px] uppercase border-2 border-blue-600 hover:bg-blue-50 transition-all active:scale-95 cursor-pointer"
            >
              Audit
            </button>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCommit(); }}
              disabled={!summary.isAuthorized}
              className={`px-10 py-4 rounded-xl font-black text-[10px] uppercase transition-all shadow-xl active:scale-95 ${
                summary.isAuthorized 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Vault
            </button>
            
            {/* Industrial Delete/Reset Control */}
            <button 
              type="button"
              onClick={handleResetClick}
              className="bg-rose-50 text-rose-600 p-4 rounded-xl border-2 border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-90 cursor-pointer flex items-center justify-center group/reset"
              title="Clear Registry"
            >
              <svg className="w-5 h-5 transition-transform group-hover/reset:rotate-12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
