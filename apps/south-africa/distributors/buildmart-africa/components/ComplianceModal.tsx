
import React from 'react';
import { OrderSummary } from '../types.ts';
import { exportOrderManifestToCSV } from '../utils/export.ts';

interface ComplianceModalProps {
  summary: OrderSummary;
  onClose: () => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ summary, onClose }) => {
  const handleAuthorize = () => {
    if (!summary.isAuthorized) return;
    exportOrderManifestToCSV(summary.activeItems, summary.totalValue);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[400] overflow-y-auto px-4 py-12 no-print">
      <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="p-12 lg:p-16">
          <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-12">Compliance Snapshot</h3>
          <div className="space-y-4 mb-12">
            {summary.activeItems.length === 0 ? (
              <div className="text-center py-20 font-black text-slate-200 uppercase italic text-2xl">Snapshot Empty</div>
            ) : (
              summary.activeItems.map(item => {
                const boxPrice = item.value / item.quantity;
                return (
                  <div key={item.code} className={`flex flex-col md:flex-row justify-between p-8 rounded-3xl border gap-6 transition-all duration-300 ${item.isVerified ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-100'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.code} — {item.item.name}</span>
                        {item.item.isPremium && <span className="bg-[#004a99] text-white text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter italic">PREMIUM</span>}
                      </div>
                      <p className="text-3xl font-black italic text-slate-900 mt-1">{item.quantity} Boxes Selected</p>
                      
                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                               <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                             </svg>
                           </div>
                           <div>
                             <span className="text-[8px] font-black text-slate-400 uppercase block tracking-tighter leading-none mb-1">Packaging Logic</span>
                             <span className="text-sm font-black text-slate-800 italic">{item.item.packsPerBox} Units / Box</span>
                             <span className="text-[10px] font-black text-blue-600 uppercase block tracking-tight italic mt-0.5">Total Line Yield: {item.packs.toLocaleString()} Units</span>
                           </div>
                        </div>
                        
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#004a99]">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                               <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                           </div>
                           <div>
                             <span className="text-[8px] font-black text-slate-400 uppercase block tracking-tighter leading-none mb-1">Calculated Rate</span>
                             <span className="text-sm font-black text-[#004a99] italic">R {boxPrice.toFixed(2)} / Box</span>
                           </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-left md:text-right flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Subtotal</p>
                      <p className="text-4xl font-black italic text-[#004a99]">R {item.value.toFixed(2)}</p>
                      <div className={`mt-2 inline-flex items-center gap-1.5 self-start md:self-end px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.isVerified ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                        {item.statusMsg}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-100">
            <div className="text-center md:text-left">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Master Verification Status</p>
               <div className={`text-4xl font-black italic uppercase tracking-tighter ${summary.isAuthorized ? 'text-emerald-500' : 'text-rose-500'}`}>
                {summary.isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED'}
              </div>
            </div>
            <button 
              disabled={!summary.isAuthorized}
              onClick={handleAuthorize}
              className={`w-full md:w-auto px-12 py-6 rounded-2xl font-black text-xs uppercase transition-all shadow-xl ${summary.isAuthorized ? 'bg-[#004a99] text-white hover:bg-blue-800 hover:scale-[1.02] active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              Authorize Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
