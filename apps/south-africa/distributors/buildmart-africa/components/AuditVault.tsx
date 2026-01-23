
import React, { useState } from 'react';
import { TransactionRecord, TierLevel } from '../types.ts';

interface AuditVaultProps {
  history: TransactionRecord[];
  onBack: () => void;
}

export const AuditVault: React.FC<AuditVaultProps> = ({ history, onBack }) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const selectedDoc = history.find(d => d.id === selectedDocId);

  return (
    <div className="min-h-screen bg-[#000] text-white -mx-6 -my-12 px-10 py-16 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between mb-16 border-b border-white/10 pb-10">
        <div>
          <button onClick={onBack} className="group mb-6 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#004a99] hover:text-blue-500 transition-all bg-white/5 px-6 py-3 rounded-full border border-white/10">
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-[-4px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            BACK TO HUB
          </button>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-[0.85]">GRV NOTES & AUDIT VAULT</h2>
          <div className="flex items-center gap-4 mt-6">
            <span className="bg-[#004a99] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest italic shadow-lg">Verified Archive Registry</span>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic border-l-2 border-[#004a99] pl-6">{history.length} SOURCE FILES LOCKED</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-12">
        {/* GRV SOURCE NOTES LIST */}
        <div className="lg:col-span-4 bg-[#0d0d0d] border border-white/5 rounded-[40px] p-10 h-fit max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl">
          <h3 className="text-xl font-black italic uppercase text-white mb-8 border-b-4 border-[#004a99] pb-4">GRV SOURCE NOTES</h3>
          <div className="space-y-4">
            {history.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-6 rounded-3xl cursor-pointer transition-all border-2 flex justify-between items-center ${selectedDocId === doc.id ? 'bg-[#004a99] border-[#004a99] text-white shadow-xl scale-105' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
              >
                <div>
                  <div className={`text-[12px] font-black uppercase italic ${selectedDocId === doc.id ? 'text-white' : 'text-blue-500'}`}>{doc.id}</div>
                  <div className={`text-[10px] font-black uppercase opacity-40 mt-1`}>{new Date(doc.timestamp).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black italic leading-none">R {doc.totalValue.toLocaleString()}</div>
                  <div className={`text-[9px] font-black uppercase mt-1 ${selectedDocId === doc.id ? 'text-blue-100' : 'text-slate-600'}`}>T{doc.tier} AUDIT</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DETAIL VIEW */}
        <div className="lg:col-span-8">
          {selectedDoc ? (
            <div className="bg-white text-black shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-[40px] p-16 relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 p-10 flex flex-col items-end opacity-20 pointer-events-none">
                 <div className="text-7xl font-black italic text-slate-900">GRV</div>
                 <div className="text-xl font-black text-slate-900 uppercase">OFFICIAL REGISTER</div>
              </div>

              <div className="flex justify-between items-start mb-16 relative z-10">
                 <div>
                    <h1 className="text-4xl font-black text-[#004a99] mb-4 uppercase italic">Goods Received Voucher</h1>
                    <div className="space-y-1 font-mono text-[12px] font-bold text-slate-600 uppercase">
                       <p>Document No: <span className="text-slate-900 font-black">{selectedDoc.id}</span></p>
                       <p>Date: <span className="text-slate-900 font-black">{new Date(selectedDoc.timestamp).toLocaleDateString()}</span></p>
                    </div>
                 </div>
                 <div className="text-right flex flex-col items-end">
                    <div className="bg-[#004a99] p-4 rounded-2xl mb-4 shadow-xl text-white">
                       <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 34V10C6 8 8 6 12 6H28C32 6 34 8 34 12V34" stroke="currentColor" strokeWidth="4"/></svg>
                    </div>
                    <p className="text-xl font-black italic text-slate-900 uppercase">Build Mart Africa (PTY) Ltd</p>
                 </div>
              </div>

              <table className="w-full mb-16 relative z-10">
                 <thead>
                    <tr className="border-b-4 border-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-900">
                       <th className="py-6 text-left">SKU CODE</th>
                       <th className="py-6 text-left">DESCRIPTION</th>
                       <th className="py-6 text-right">METERS REC</th>
                       <th className="py-6 text-right">UNIT RATE</th>
                       <th className="py-6 text-right">TOTAL (EX)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 font-mono text-[12px] font-bold text-slate-800">
                    {selectedDoc.items.map(line => (
                       <tr key={line.code}>
                          <td className="py-5 font-black">{line.code}</td>
                          <td className="py-5 uppercase text-[10px]">{line.item.name}</td>
                          <td className="py-5 text-right font-black">{(line.quantity * line.item.boxMeterage).toFixed(1)}</td>
                          <td className="py-5 text-right">{(line.value / (line.quantity * line.item.boxMeterage)).toFixed(2)}</td>
                          <td className="py-5 text-right font-black">{line.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>

              <div className="flex justify-end mb-16 relative z-10">
                 <div className="w-full max-w-sm">
                    <div className="flex justify-between bg-slate-900 text-white p-6 rounded-3xl shadow-2xl">
                       <span className="text-sm font-black uppercase tracking-widest">Grand Total (Excl)</span>
                       <span className="text-3xl font-black italic tracking-tighter">R {selectedDoc.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                 </div>
              </div>

              <div className="flex justify-between items-end border-t-4 border-slate-900 pt-12 relative z-10">
                 <div className="opacity-40">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4 italic">Ledger Verification Node</p>
                    <div className="w-28 h-28 border-8 border-[#004a99] rounded-full flex flex-col items-center justify-center transform rotate-[-15deg]">
                       <div className="text-[12px] font-black text-[#004a99] leading-none uppercase">Audited</div>
                       <div className="text-[9px] font-black text-[#004a99] mt-1 italic">HUB-PRE-01</div>
                    </div>
                 </div>
                 <div className="text-right text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">ISO 9001 QUALIFIED HUB</div>
              </div>
            </div>
          ) : (
            <div className="h-[80vh] bg-white/5 border-4 border-dashed border-white/10 rounded-[60px] flex flex-col items-center justify-center text-slate-700">
               <svg className="w-32 h-32 mb-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
               <p className="text-3xl font-black italic uppercase text-slate-500">GRV RECORD SELECTION AWAITING</p>
               <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 text-slate-800">Verify historical parity across 18 source files.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
