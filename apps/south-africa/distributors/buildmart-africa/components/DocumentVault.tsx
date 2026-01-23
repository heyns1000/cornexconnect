
import React, { useState } from 'react';
import { TransactionRecord, TierLevel } from '../types.ts';

interface DocumentVaultProps {
  history: TransactionRecord[];
  onBack: () => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({ history, onBack }) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const selectedDoc = history.find(d => d.id === selectedDocId);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <button onClick={onBack} className="group mb-6 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#004a99] hover:text-blue-800 transition-all bg-blue-50 px-5 py-2.5 rounded-full border border-blue-100">
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-[-4px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Hub
          </button>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-[0.85]">Secure Document Vault</h2>
          <div className="flex items-center gap-4 mt-4">
            <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest italic">Immutable Audit Trail</span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-l-2 border-[#004a99] pl-4">18 Source Files Locked</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-slate-50 border-2 border-slate-200 rounded-[40px] p-10 h-fit max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-black italic uppercase text-slate-900 mb-8 border-b-4 border-slate-200 pb-4">Voucher Registry</h3>
          <div className="space-y-4">
            {history.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 flex justify-between items-center ${selectedDocId === doc.id ? 'bg-[#004a99] border-[#004a99] text-white shadow-xl scale-105' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}
              >
                <div>
                  <div className={`text-[11px] font-black uppercase italic ${selectedDocId === doc.id ? 'text-blue-200' : 'text-[#004a99]'}`}>{doc.id}</div>
                  <div className={`text-[9px] font-black uppercase opacity-60 mt-1`}>{new Date(doc.timestamp).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black italic leading-none">R {doc.totalValue.toLocaleString()}</div>
                  <div className={`text-[8px] font-black uppercase mt-1 ${selectedDocId === doc.id ? 'text-blue-100' : 'text-slate-400'}`}>T{doc.tier} Audit</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8">
          {selectedDoc ? (
            <div className="bg-white shadow-2xl rounded-[40px] border-2 border-slate-100 p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 flex flex-col items-end opacity-20 pointer-events-none">
                 <div className="text-6xl font-black italic text-slate-900">GRV</div>
                 <div className="text-xl font-black text-slate-900">OFFICIAL COPY</div>
              </div>

              {/* GRV HEADER MIRROR */}
              <div className="flex justify-between items-start mb-16">
                 <div>
                    <h1 className="text-4xl font-black text-[#004a99] mb-4">Goods Received Voucher</h1>
                    <div className="space-y-1 font-mono text-[11px] font-bold text-slate-600 uppercase">
                       <p>Document No: <span className="text-slate-900">{selectedDoc.id}</span></p>
                       <p>Date: <span className="text-slate-900">{new Date(selectedDoc.timestamp).toLocaleDateString()}</span></p>
                       <p>Your Acc No: <span className="text-slate-900">HOM001</span></p>
                    </div>
                 </div>
                 <div className="text-right flex flex-col items-end">
                    <div className="bg-[#004a99] p-3 rounded-xl mb-4">
                       <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 34V10C6 8 8 6 12 6H28C32 6 34 8 34 12V34" stroke="white" strokeWidth="4"/></svg>
                    </div>
                    <p className="text-lg font-black italic text-slate-900">BUILD MART AFRICA (PTY) LTD</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest max-w-[200px]">30 KYALAMI ROAD, WESTMEAD, 3610</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-16 border-y-2 border-slate-100 py-10">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplier:</p>
                    <p className="text-xl font-black italic text-slate-900 uppercase">HOME MART XPS</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deliver To:</p>
                    <p className="text-xl font-black italic text-slate-900 uppercase">PRETORIA CENTRAL HUB</p>
                 </div>
              </div>

              {/* ITEM TABLE MIRROR */}
              <table className="w-full mb-16">
                 <thead>
                    <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-900">
                       <th className="py-4 text-left">Item Code</th>
                       <th className="py-4 text-left">Item Description</th>
                       <th className="py-4 text-right">Ordered</th>
                       <th className="py-4 text-right">Quantity Rec</th>
                       <th className="py-4 text-right">Price (Ex)</th>
                       <th className="py-4 text-right">Total (Excl)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 font-mono text-[11px] font-bold text-slate-700">
                    {selectedDoc.items.map(line => (
                       <tr key={line.code}>
                          <td className="py-4">{line.code}</td>
                          <td className="py-4 uppercase text-[9px]">{line.item.name}</td>
                          <td className="py-4 text-right">{(line.quantity * line.item.boxMeterage).toFixed(2)}</td>
                          <td className="py-4 text-right">{(line.quantity * line.item.boxMeterage).toFixed(2)}</td>
                          <td className="py-4 text-right">{(line.value / (line.quantity * line.item.boxMeterage)).toFixed(2)}</td>
                          <td className="py-4 text-right">{line.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>

              <div className="flex justify-end mb-16">
                 <div className="w-full max-w-xs space-y-3 font-mono">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                       <span className="text-[10px] font-black uppercase text-slate-400">Total (Excl)</span>
                       <span className="text-sm font-black text-slate-900">R {selectedDoc.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                       <span className="text-[10px] font-black uppercase text-slate-400">Tax (15%)</span>
                       <span className="text-sm font-black text-slate-900">R {(selectedDoc.totalValue * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between bg-slate-900 text-white p-4 rounded-xl">
                       <span className="text-xs font-black uppercase tracking-widest">Total (Incl)</span>
                       <span className="text-xl font-black italic tracking-tighter">R {(selectedDoc.totalValue * 1.15).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                 </div>
              </div>

              <div className="flex justify-between items-end border-t-2 border-slate-900 pt-10">
                 <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-black uppercase text-slate-400 w-24">Received By:</span>
                       <div className="flex-1 border-b border-dashed border-slate-300 h-6"></div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-black uppercase text-slate-400 w-24">Signed:</span>
                       <div className="flex-1 border-b border-dashed border-slate-300 h-6"></div>
                    </div>
                 </div>
                 <div className="ml-20 text-right">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2 italic">Official Ledger Stamp</p>
                    <div className="w-24 h-24 border-4 border-[#004a99] rounded-full flex flex-col items-center justify-center opacity-30 transform rotate-[-12deg]">
                       <div className="text-[10px] font-black text-[#004a99] leading-none">AUDITED</div>
                       <div className="text-[8px] font-black text-[#004a99] mt-1 italic">HUB-PRE-01</div>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-[80vh] bg-slate-50 border-4 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-slate-300">
               <svg className="w-32 h-32 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
               <p className="text-2xl font-black italic uppercase">Awaiting Document Selection</p>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2">Historical Parity Checks Enabled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
