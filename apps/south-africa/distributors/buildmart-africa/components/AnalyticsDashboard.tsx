
import React, { useState, useMemo } from 'react';
import { TransactionRecord, CategoryMetrics } from '../types.ts';
import { INDUSTRIAL_DATA_ARCHIVE } from '../dataArchive.ts';

interface AnalyticsDashboardProps {
  history: TransactionRecord[];
  onBack: () => void;
  onAssistClick: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ history, onBack, onAssistClick }) => {
  const [probeQuery, setProbeQuery] = useState('');

  const metrics = useMemo(() => {
    const totalSpent = history.reduce((sum, txn) => sum + txn.totalValue, 0);
    const skuStats: Record<string, { freq: number; vol: number; valuation: number }> = {};
    const categoryTotals: Record<string, { spent: number; boxes: number }> = {};

    history.forEach(txn => {
      txn.items.forEach(item => {
        if (!skuStats[item.code]) skuStats[item.code] = { freq: 0, vol: 0, valuation: 0 };
        skuStats[item.code].freq += 1;
        skuStats[item.code].vol += item.quantity;
        skuStats[item.code].valuation += item.value;

        const cat = item.item.category;
        if (!categoryTotals[cat]) categoryTotals[cat] = { spent: 0, boxes: 0 };
        categoryTotals[cat].spent += item.value;
        categoryTotals[cat].boxes += item.quantity;
      });
    });

    const logicGroups = [
      { id: 1, name: "XPS CONICE 2M SERIES RANGE (BULK REGISTRY)", key: "XPS CONICE 2M Series Range (Bulk Registry)", yield: 16.7 },
      { id: 2, name: "SPECIALTY PROFILES & STANDARD SERIES", key: "Specialty Profiles & Standard Series", yield: 13.7 },
      { id: 3, name: "CASA MILANO 110MM SERIES RANGE", key: "CASA MILANO 110mm Series Range", yield: 47.0 },
      { id: 4, name: "CASA MILANO 140MM RANGE", key: "CASA MILANO 140mm Range", yield: 19.6 },
      { id: 5, name: "PREMIUM PROFILES (LARGE HIGH-DENSITY)", key: "Premium Profiles (Large High-Density)", yield: 2.9 }
    ];

    const sortedSkuStats = Object.entries(skuStats).sort(([, a], [, b]) => b.freq - a.freq || b.vol - a.vol);
    const top10 = sortedSkuStats.slice(0, 10);
    const top5FastMovers = sortedSkuStats.slice(0, 5).map(([code, stats]) => ({
      code,
      ...stats,
      contribution: (stats.valuation / totalSpent) * 100
    }));

    return { totalSpent, logicGroups, top10, top5FastMovers, categoryTotals };
  }, [history]);

  return (
    <div className="fixed inset-0 bg-black text-white z-[300] overflow-y-auto px-10 py-16 animate-in fade-in duration-500 custom-scrollbar">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between mb-16">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
          <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-white/5 shadow-xl">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white"><path d="M15 19l-7-7 7-7" /></svg>
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">FAA ACTUARY HUB</h1>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic">18 VERIFIED BUILD SOURCES ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-12">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">GLOBAL VALUATION</p>
              <p className="text-4xl font-black italic text-emerald-500 tracking-tighter">R {metrics.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
           </div>
           <button onClick={onAssistClick} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.4)] animate-pulse">Sync Assistant</button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
           {/* FAST MOVERS ANALYSIS */}
           <div className="bg-[#111] rounded-[40px] p-12 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white border-b-4 border-emerald-500 pb-2">Fast Movers Analysis</h3>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Top 5 SKU Contribution</span>
              </div>
              <div className="grid gap-6">
                 {metrics.top5FastMovers.map((mover, i) => (
                    <div key={mover.code} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500 transition-all">
                       <div className="flex items-center gap-6">
                          <span className="text-4xl font-black italic text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">0{i+1}</span>
                          <div>
                             <p className="text-2xl font-black italic uppercase tracking-tighter text-white">{mover.code}</p>
                             <div className="flex gap-4 mt-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase italic">{mover.freq} Transactions</span>
                                <span className="text-[9px] font-black text-slate-500 uppercase italic">{mover.vol.toLocaleString()} Boxes Total</span>
                             </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 italic">Market Contribution</p>
                          <p className="text-3xl font-black italic text-white tracking-tighter">{mover.contribution.toFixed(1)}%</p>
                          <div className="w-32 h-1 bg-white/5 mt-2 rounded-full overflow-hidden ml-auto">
                             <div className="h-full bg-emerald-500" style={{ width: `${mover.contribution}%` }}></div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* LOGIC PROBE */}
           <div className="bg-[#111] rounded-[32px] p-10 border border-white/5 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-6">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">LOGIC PROBE INTERFACE</span>
              </div>
              <div className="flex gap-4">
                 <input 
                  type="text" 
                  value={probeQuery}
                  onChange={(e) => setProbeQuery(e.target.value)}
                  placeholder="Probe market parity for current GRVs..."
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-bold text-lg italic text-white placeholder:text-slate-700"
                 />
                 <button className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all">Run Analysis</button>
              </div>
           </div>

           {/* SECTION COMBOS */}
           <div className="grid md:grid-cols-2 gap-8">
              {metrics.logicGroups.map((group, i) => (
                <div key={i} className={`bg-[#111] border border-white/5 rounded-[32px] p-8 group hover:border-blue-500 transition-all ${i === 4 ? 'md:col-span-2' : ''}`}>
                   <div className="flex justify-between items-start mb-8">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-4 py-1.5 rounded-full italic">SECTION COMBO {i+1}</span>
                      <span className="text-[11px] font-black text-emerald-500 italic">{group.yield}% Yield</span>
                   </div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 leading-tight min-h-[3rem]">{group.name}</h3>
                   <div className="flex justify-between items-end border-t border-white/5 pt-6">
                      <div>
                         <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">TOTAL BOX VOLUME</p>
                         <p className="text-3xl font-black italic text-white">{(metrics.categoryTotals[group.key]?.boxes || 0).toLocaleString()}</p>
                         <div className="w-24 h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${group.yield}%` }}></div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">VOUCHER VALUE</p>
                         <p className="text-3xl font-black italic text-white">R {(metrics.categoryTotals[group.key]?.spent || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <div className="bg-[#111] rounded-[40px] p-12 border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 border-b-4 border-blue-600 pb-4 inline-block">SKU VELOCITY NODES</h3>
              <div className="space-y-8">
                 {metrics.top10.map(([sku, stats], i) => (
                    <div key={sku} className="flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                          <span className="text-slate-800 font-black italic text-2xl">0{i+1}</span>
                          <span className="font-black italic text-3xl group-hover:text-blue-500 transition-colors tracking-tighter uppercase">{sku}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-[9px] font-black text-slate-600 uppercase block mb-1 italic">FREQUENCY</span>
                          <span className="text-xl font-black text-blue-400 italic">{(stats as any).freq} Orders</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-blue-600 rounded-[40px] p-12 shadow-[0_0_60px_rgba(37,99,235,0.3)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <svg className="w-24 h-24" fill="white" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-6">ACTUARY NOTE</h4>
              <p className="text-blue-100 text-sm font-black uppercase tracking-widest italic leading-relaxed mb-10">
                The current R {metrics.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })} manufacturing history demonstrates a strong yield. Fast movers represent over 30% of global inventory churn.
              </p>
              <button className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] transition-all">Export Forensic Report</button>
           </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto mt-20">
         <div className="bg-[#111] rounded-[40px] p-12 border border-white/5">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 text-white">VERIFIED AUDIT REGISTRY</h3>
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <th className="pb-6">VOUCHER ID</th>
                       <th className="pb-6">COMMITED ON</th>
                       <th className="pb-6">TIER NODE</th>
                       <th className="pb-6 text-right">GROSS VALUATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(txn => (
                      <tr key={txn.id} className="border-b border-white/[0.03] group hover:bg-white/[0.02] transition-all">
                         <td className="py-6 font-black italic text-blue-400 cursor-pointer">{txn.id}</td>
                         <td className="py-6 font-black italic text-slate-400">{new Date(txn.timestamp).toLocaleDateString()}</td>
                         <td className="py-6">
                            <span className="text-[8px] font-black bg-white/5 px-3 py-1 rounded uppercase tracking-widest text-slate-500">Tier {txn.tier} Verification</span>
                         </td>
                         <td className="py-6 text-right font-black italic text-emerald-400 text-lg">R {txn.totalValue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};
