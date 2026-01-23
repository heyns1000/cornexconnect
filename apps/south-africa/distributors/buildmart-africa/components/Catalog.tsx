
import React, { useState } from 'react';
import { PricingItem, TierLevel, OrderItem, TransactionRecord } from '../types.ts';

interface CatalogProps {
  items: PricingItem[];
  searchTerm: string;
  selectedTier: TierLevel;
  quantities: Record<string, number>;
  onQtyChange: (code: string, qty: number) => void;
  onBulkQtyChange: (updates: Record<string, number>) => void;
  activeOrderItems: OrderItem[];
  history: TransactionRecord[];
}

export const Catalog: React.FC<CatalogProps> = ({ 
  items, 
  searchTerm, 
  selectedTier, 
  quantities, 
  onQtyChange,
  onBulkQtyChange,
  activeOrderItems,
  history
}) => {
  const categories = Array.from(new Set(items.map(i => i.category)));
  
  const skuVelocity = React.useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach(txn => {
      txn.items.forEach(item => {
        counts[item.code] = (counts[item.code] || 0) + item.quantity;
      });
    });
    return counts;
  }, [history]);

  const maxVolume = Math.max(...(Object.values(skuVelocity) as number[]), 1);

  const filteredItems = items.filter(item => 
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.dimensions.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopySKU = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const projectCategory = (category: string) => {
    if (selectedTier === TierLevel.NONE) {
      alert("SELECT TIER FIRST");
      return;
    }

    const catItems = items.filter(i => i.category === category);
    const updates: Record<string, number> = { ...quantities };
    
    let moversFound = false;
    catItems.forEach(item => {
      const historyExists = skuVelocity[item.code] && skuVelocity[item.code] > 0;
      
      if (historyExists) {
        moversFound = true;
        const price = selectedTier === TierLevel.FACTORY_BULK ? item.tier1Price :
                      selectedTier === TierLevel.TRADE_WHOLESALE ? item.tier2Price :
                      item.tier3Price;
        const boxVal = item.boxMeterage * price;
        
        let targetQty = 0;
        if (selectedTier === TierLevel.FACTORY_BULK) {
          targetQty = Math.ceil(29000 / boxVal);
        } else if (selectedTier === TierLevel.TRADE_WHOLESALE) {
          targetQty = Math.ceil(14500 / boxVal);
        } else if (selectedTier === TierLevel.STANDARD_RETAIL) {
          targetQty = 2;
        }

        if (targetQty > 0) updates[item.code] = targetQty;
      }
    });

    if (moversFound) {
      onBulkQtyChange(updates);
    } else {
      alert(`No verified audit history found for ${category}. Projection skipped.`);
    }
  };

  const handleValidation = (code: string, value: string) => {
    if (value === '') {
      onQtyChange(code, 0);
      return;
    }
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      onQtyChange(code, parsed);
    }
  };

  return (
    <div id="catalog" className="bg-white border border-slate-100 rounded-[40px] shadow-2xl overflow-hidden mb-20 print:border-none print:shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-extrabold text-[9px] uppercase tracking-widest border-b border-slate-100">
              <th className="text-left px-10 py-8 w-[25%]">Product SKU Profile Registry</th>
              <th className="text-center px-4 py-8">Dimensions</th>
              <th className="text-center px-4 py-8">Units/Box</th>
              <th className="text-center px-4 py-8">Meterage</th>
              <th className="text-center px-4 py-8 italic text-emerald-600">Base Cost (Ex)</th>
              <th className="text-center px-4 py-8 text-blue-400">Tier 1</th>
              <th className="text-center px-4 py-8 text-indigo-400">Tier 2</th>
              <th className="text-center px-4 py-8 text-slate-400">Tier 3</th>
              <th className="text-center px-4 py-8 italic">Valuation Registry</th>
              <th className="text-center px-4 py-8 bg-[#004a99] text-white no-print">Order Control (Boxes)</th>
            </tr>
          </thead>
          <tbody className="text-[13px] font-bold text-slate-700">
            {categories.map((category: string) => {
              const catItems = filteredItems.filter(item => item.category === category);
              if (catItems.length === 0) return null;

              return (
                <React.Fragment key={category}>
                  <tr className="category-header z-20 no-print">
                    <td 
                      colSpan={9} 
                      className="sticky top-[72px] px-10 py-6 italic font-black uppercase text-[10px] tracking-widest bg-[#001f3f] text-white border-y border-white/5 z-20"
                    >
                       <div className="flex items-center gap-2">
                         <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
                         {category}
                       </div>
                    </td>
                    <td className="sticky top-[72px] text-center py-6 bg-[#001f3f] text-white z-20">
                       <button onClick={() => projectCategory(category)} className="bg-[#004a99] text-white text-[9px] px-6 py-2.5 rounded-full hover:bg-blue-600 transition-all font-black uppercase tracking-widest shadow-xl border border-white/10 active:scale-95">Project Category Demand</button>
                    </td>
                  </tr>
                  {catItems.map((item: PricingItem) => {
                    const price = selectedTier === TierLevel.FACTORY_BULK ? item.tier1Price : selectedTier === TierLevel.TRADE_WHOLESALE ? item.tier2Price : item.tier3Price;
                    const boxPrice = item.boxMeterage * price;
                    const qty = quantities[item.code] || 0;
                    const velocityScore = (skuVelocity[item.code] || 0) / maxVolume;
                    const isSelected = qty > 0;
                    const isFastMover = velocityScore > 0.7;

                    return (
                      <tr 
                        key={item.code} 
                        className={`item-row border-b border-slate-100 transition-all duration-300 relative group z-0 
                        ${isSelected ? 'bg-blue-600/[0.08] border-l-[16px] border-l-blue-600' : 'bg-white border-l-[16px] border-l-transparent'}
                        ${isFastMover ? 'fast-mover-glow' : ''} 
                        hover:bg-slate-50 print:border-l-0`}
                      >
                        <td className="px-10 py-8 relative">
                          {isFastMover && (
                            <div className="absolute top-0 left-[-16px] bottom-0 w-[4px] bg-amber-400 animate-pulse"></div>
                          )}
                          <div className="flex items-center gap-4 mb-2">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded italic border transition-all ${isFastMover ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {isFastMover ? 'FAST MOVER' : 'LOW TURN'}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="font-black uppercase italic leading-tight text-xl text-slate-900 tracking-tighter group-hover:text-blue-950">{item.code}</div>
                              <button 
                                onClick={() => handleCopySKU(item.code)}
                                title="Copy SKU"
                                className="no-print p-1 text-slate-400 hover:text-blue-600 hover:bg-white/50 rounded transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="text-[9px] text-slate-400 uppercase font-black leading-tight max-w-[200px] group-hover:text-black">{item.name}</div>
                        </td>
                        <td className="text-center text-slate-400 italic font-black text-xs">{item.dimensions}</td>
                        <td className="text-center"><div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-blue-400"><span className="text-lg font-black">{item.packsPerBox}</span><span className="text-[8px] text-slate-400 font-black">U/B</span></div></td>
                        <td className="text-center font-black italic text-xl text-slate-900 group-hover:text-blue-900">{item.boxMeterage}m</td>
                        <td className="text-center font-black text-emerald-600 italic">R {item.tier1Price.toFixed(2)}</td>
                        <td className="text-center font-black text-blue-400 italic">R {item.tier1Price.toFixed(2)}</td>
                        <td className="text-center font-black text-indigo-400 italic">R {item.tier2Price.toFixed(2)}</td>
                        <td className="text-center font-black text-slate-300 italic">R {item.tier3Price.toFixed(2)}</td>
                        <td className="px-6">
                           <div className="flex flex-col gap-1.5">
                              <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100 group-hover:bg-white group-hover:border-blue-400">
                                <span className="text-[7px] text-slate-400 font-black block italic">RATE / M</span>
                                <span className="text-lg font-black text-slate-900 italic group-hover:text-blue-900">R {price.toFixed(2)}</span>
                              </div>
                              <div className="bg-[#001f3f] text-white p-2 rounded-xl text-center shadow-lg group-hover:bg-blue-900 transition-colors">
                                <span className="text-[7px] text-blue-400 font-black block italic">BOX TOTAL</span>
                                <span className="text-xs font-black">R {boxPrice.toFixed(2)}</span>
                              </div>
                           </div>
                        </td>
                        <td className={`px-8 text-center no-print ${isSelected ? 'bg-blue-600/[0.05]' : ''}`}>
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner w-44 group-hover:border-blue-700 transition-colors">
                              <button onClick={() => onQtyChange(item.code, Math.max(0, qty - 1))} className="px-4 py-4 hover:bg-slate-50 text-slate-400 flex-1 transition-colors cursor-pointer"><svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M20 12H4" /></svg></button>
                              <input 
                                type="text" 
                                value={qty || ''} 
                                onChange={(e) => handleValidation(item.code, e.target.value)} 
                                className="w-16 h-14 bg-[#333] text-white text-center font-black text-2xl focus:outline-none focus:ring-4 focus:ring-blue-500" 
                              />
                              <button onClick={() => onQtyChange(item.code, qty + 1)} className="px-4 py-4 hover:bg-slate-50 text-slate-400 flex-1 transition-colors cursor-pointer"><svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg></button>
                            </div>
                            <div className="min-h-[1.5rem] flex items-center justify-center">
                              {isSelected && (
                                <span className="text-sm font-black text-blue-800 uppercase italic tracking-tighter animate-in fade-in duration-300">
                                  {(qty * item.boxMeterage).toLocaleString()}M YIELD
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
