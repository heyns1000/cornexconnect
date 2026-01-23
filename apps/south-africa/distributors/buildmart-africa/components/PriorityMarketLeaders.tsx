
import React from 'react';
import { INVENTORY_REGISTRY } from '../constants.tsx';
import { TransactionRecord, TierLevel } from '../types.ts';

interface PriorityMarketLeadersProps {
  quantities: Record<string, number>;
  onQtyChange: (code: string, qty: number) => void;
  history: TransactionRecord[];
  selectedTier: TierLevel;
}

export const PriorityMarketLeaders: React.FC<PriorityMarketLeadersProps> = ({ quantities, onQtyChange, history, selectedTier }) => {
  const leaders = ['CAS04', 'CAS02', 'CAS03']; // Based on screenshot sequence
  
  const handleQuickFill = (code: string) => {
    if (selectedTier === TierLevel.NONE) {
      alert("SELECT TIER FIRST");
      return;
    }
    const item = INVENTORY_REGISTRY.find(i => i.code === code);
    if (!item) return;

    // Calc average from history or default to logic gate
    const price = selectedTier === TierLevel.FACTORY_BULK ? item.tier1Price :
                  selectedTier === TierLevel.TRADE_WHOLESALE ? item.tier2Price :
                  item.tier3Price;
    
    let defaultQty = 1;
    if (selectedTier === TierLevel.FACTORY_BULK) defaultQty = Math.ceil(29000 / (item.boxMeterage * price));
    else if (selectedTier === TierLevel.TRADE_WHOLESALE) defaultQty = Math.ceil(14500 / (item.boxMeterage * price));
    else defaultQty = 2;

    onQtyChange(code, defaultQty);
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-black italic uppercase text-slate-900 mb-8 tracking-tighter">Priority Market Leaders</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {leaders.map((code, i) => {
          const item = INVENTORY_REGISTRY.find(it => it.code === code);
          if (!item) return null;
          
          return (
            <div key={code} className="bg-white border-2 border-slate-100 p-8 rounded-[32px] shadow-sm relative overflow-hidden group hover:border-blue-500 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <div className="w-16 h-16 rounded-full bg-slate-200"></div>
              </div>
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase text-blue-500 italic tracking-widest block mb-1">Leader Node 0{i+1}</span>
                <h4 className="text-4xl font-black italic text-slate-900 uppercase tracking-tighter mb-2">{code}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">{item.name}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 italic">Active Yield</span>
                    <span className="text-2xl font-black italic text-slate-900">R {item.tier3Price.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => handleQuickFill(code)}
                    className="bg-[#004a99] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                  >
                    Quick Fill
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
