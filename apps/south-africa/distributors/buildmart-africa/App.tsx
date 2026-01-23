
import React, { useState, useMemo, useEffect } from 'react';
import { TierLevel, OrderSummary, OrderItem, TransactionRecord } from './types.ts';
import { INVENTORY_REGISTRY } from './constants.tsx';
import { Header } from './components/Header.tsx';
import { TierSelection } from './components/TierSelection.tsx';
import { IntelligenceDeployment } from './components/IntelligenceDeployment.tsx';
import { PriorityMarketLeaders } from './components/PriorityMarketLeaders.tsx';
import { Catalog } from './components/Catalog.tsx';
import { FloatingDashboard } from './components/FloatingDashboard.tsx';
import { ComplianceModal } from './components/ComplianceModal.tsx';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
import { AuditVault } from './components/AuditVault.tsx';
import { FruitfulAssist } from './components/FruitfulAssist.tsx';
import { AdGenerator } from './components/AdGenerator.tsx';

const STORAGE_KEY = 'CORNEXCONNECT_ORDER_DRAFT';
const DB_KEY = 'CORNEXCONNECT_TRANS_DB';

type ViewMode = 'REGISTRY' | 'INTELLIGENCE' | 'VAULT' | 'AD_GENERATOR';

const mapVoucherLine = (code: string, meters: number, rateEx: number): OrderItem => {
  const item = INVENTORY_REGISTRY.find(i => i.code === code) || INVENTORY_REGISTRY[0];
  const qtyBoxes = Math.ceil(meters / item.boxMeterage);
  const valuation = meters * rateEx;
  return {
    code,
    quantity: qtyBoxes,
    item,
    value: valuation,
    pieces: meters / 2,
    packs: (meters / item.boxMeterage) * item.packsPerBox,
    isVerified: true,
    statusMsg: 'AUDITED SOURCE'
  };
};

const MOCK_HISTORY: TransactionRecord[] = [
  { id: 'GRV001094', timestamp: new Date('2024/06/24').getTime(), totalValue: 68979.20, tier: TierLevel.FACTORY_BULK, items: [
    mapVoucherLine('CAS-BR01', 400, 24.80), mapVoucherLine('CAS-BR02', 480, 20.00), mapVoucherLine('CAS-BR07', 672, 20.00),
    mapVoucherLine('CAS-BR08', 672, 20.00), mapVoucherLine('CAS-BR09', 504, 24.80), mapVoucherLine('CAS-BR13', 700, 14.40)
  ]},
  { id: 'GRV001097', timestamp: new Date('2024/06/26').getTime(), totalValue: 121716.80, tier: TierLevel.FACTORY_BULK, items: [
    mapVoucherLine('CAS10', 1200, 6.86), mapVoucherLine('CAS03', 2430, 9.92), mapVoucherLine('CAS04', 1350, 9.92),
    mapVoucherLine('CAS12', 630, 9.92), mapVoucherLine('CAS06', 1750, 11.78), mapVoucherLine('CAS11', 490, 11.78),
    mapVoucherLine('CAS08', 1610, 11.78), mapVoucherLine('CAS07', 630, 11.78), mapVoucherLine('CAS05', 990, 9.92),
    mapVoucherLine('CAS02', 720, 9.92)
  ]},
  { id: 'GRV001104', timestamp: new Date('2024/07/01').getTime(), totalValue: 62080.00, tier: TierLevel.FACTORY_BULK, items: [
    mapVoucherLine('CAS-BR01', 400, 24.80), mapVoucherLine('CAS-BR02', 480, 20.00), mapVoucherLine('CAS-BR03', 880, 20.00),
    mapVoucherLine('CAS-BR06', 960, 20.00), mapVoucherLine('CAS-BR08', 288, 20.00)
  ]},
  { id: 'GRV001105', timestamp: new Date('2024/06/28').getTime(), totalValue: 86496.00, tier: TierLevel.FACTORY_BULK, items: [
    mapVoucherLine('CAS-BR04', 880, 24.80), mapVoucherLine('CAS-BR07', 288, 20.00), mapVoucherLine('CAS-BR09', 240, 24.80),
    mapVoucherLine('CAS-BR10', 720, 24.80), mapVoucherLine('CAS-BR11', 640, 32.80), mapVoucherLine('CAS-BR12', 240, 16.80),
    mapVoucherLine('CAS-BR13', 700, 14.40)
  ]},
  { id: 'GRV001207', timestamp: new Date('2024/07/22').getTime(), totalValue: 47454.90, tier: TierLevel.TRADE_WHOLESALE, items: [
    mapVoucherLine('CAS02', 900, 10.17), mapVoucherLine('CAS04', 720, 10.17), mapVoucherLine('CAS05', 720, 10.17),
    mapVoucherLine('CAS07', 770, 12.07), mapVoucherLine('CAS11', 280, 12.07), mapVoucherLine('CAS12', 1080, 10.17)
  ]},
  { id: 'GRV001371', timestamp: new Date('2024/08/15').getTime(), totalValue: 43371.90, tier: TierLevel.TRADE_WHOLESALE, items: [
    mapVoucherLine('CAS03', 450, 9.92), mapVoucherLine('CAS04', 1980, 10.17), mapVoucherLine('CAS05', 90, 10.17),
    mapVoucherLine('CAS13', 1800, 9.92)
  ]},
  { id: 'GRV001508', timestamp: new Date('2024/09/06').getTime(), totalValue: 145496.00, tier: TierLevel.FACTORY_BULK, items: [
    mapVoucherLine('CAS01', 3240, 7.03), mapVoucherLine('CAS02', 2250, 10.42), mapVoucherLine('CAS04', 720, 10.42),
    mapVoucherLine('CAS06', 420, 12.07), mapVoucherLine('CAS07', 1750, 12.07), mapVoucherLine('CAS08', 1050, 12.07),
    mapVoucherLine('CAS11', 1120, 12.07), mapVoucherLine('CAS12', 2700, 10.42), mapVoucherLine('CAS14', 1080, 10.42)
  ]},
  { id: 'GRV001509', timestamp: new Date('2024/09/09').getTime(), totalValue: 95951.90, tier: TierLevel.FACTORY_BULK, items: [
    mapVoucherLine('CAS02', 1890, 10.42), mapVoucherLine('CAS03', 1080, 10.42), mapVoucherLine('CAS04', 2070, 10.42),
    mapVoucherLine('CAS06', 70, 12.07), mapVoucherLine('CAS08', 910, 12.07), mapVoucherLine('CAS13', 2790, 10.42)
  ]},
  { id: 'GRV001518', timestamp: new Date('2024/09/09').getTime(), totalValue: 95951.90, tier: TierLevel.FACTORY_BULK, items: [
    mapVoucherLine('CAS02', 1890, 10.42), mapVoucherLine('CAS03', 1080, 10.42), mapVoucherLine('CAS04', 2070, 10.42),
    mapVoucherLine('CAS06', 70, 12.07), mapVoucherLine('CAS08', 910, 12.07), mapVoucherLine('CAS07', 210, 12.07),
    mapVoucherLine('CAS13', 2790, 10.42)
  ]},
  { id: 'GRV001798', timestamp: new Date('2024/11/06').getTime(), totalValue: 48367.20, tier: TierLevel.TRADE_WHOLESALE, items: [
    mapVoucherLine('CAS01', 1680, 7.03), mapVoucherLine('CAS05', 1170, 10.17), mapVoucherLine('CAS09', 440, 12.74),
    mapVoucherLine('CAS15', 490, 12.07), mapVoucherLine('CAS04', 450, 10.42), mapVoucherLine('CAS07', 700, 12.07)
  ]},
  { id: 'GRV001799', timestamp: new Date('2024/11/06').getTime(), totalValue: 9153.00, tier: TierLevel.STANDARD_RETAIL, items: [
    mapVoucherLine('CAS03', 900, 10.17)
  ]},
  { id: 'GRV001800', timestamp: new Date('2024/11/04').getTime(), totalValue: 92266.45, tier: TierLevel.FACTORY_BULK, items: [
    mapVoucherLine('CAS01', 3120, 7.03), mapVoucherLine('CAS05', 630, 10.17), mapVoucherLine('CAS09', 935, 13.05),
    mapVoucherLine('CAS10', 2400, 7.03), mapVoucherLine('CAS11', 840, 12.07), mapVoucherLine('CAS15', 910, 12.07),
    mapVoucherLine('CAS03', 900, 10.17), mapVoucherLine('CAS04', 450, 10.17)
  ]},
  { id: 'GRV001802', timestamp: new Date('2024/11/06').getTime(), totalValue: 5742.00, tier: TierLevel.STANDARD_RETAIL, items: [
    mapVoucherLine('CAS09', 440, 13.05)
  ]},
  { id: 'GRV001803', timestamp: new Date('2024/11/11').getTime(), totalValue: 48391.10, tier: TierLevel.TRADE_WHOLESALE, items: [
    mapVoucherLine('CAS01', 1680, 7.03), mapVoucherLine('CAS05', 1170, 10.17), mapVoucherLine('CAS09', 440, 13.05),
    mapVoucherLine('CAS15', 490, 12.07), mapVoucherLine('CAS04', 450, 10.17), mapVoucherLine('CAS07', 700, 12.07)
  ]},
  { id: 'GRV001876', timestamp: new Date('2024/11/21').getTime(), totalValue: 117644.20, tier: TierLevel.FACTORY_BULK, items: [
    mapVoucherLine('CAS01', 3600, 7.03), mapVoucherLine('CAS02', 1530, 10.17), mapVoucherLine('CAS03', 1800, 10.17),
    mapVoucherLine('CAS04', 900, 10.17), mapVoucherLine('CAS06', 700, 12.07), mapVoucherLine('CAS10', 3600, 7.03),
    mapVoucherLine('CAS12', 1530, 10.17)
  ]},
  { id: 'GRV001958', timestamp: new Date('2024/12/09').getTime(), totalValue: 90912.95, tier: TierLevel.FACTORY_BULK, items: [
    mapVoucherLine('CAS02', 180, 10.17), mapVoucherLine('CAS03', 630, 10.17), mapVoucherLine('CAS04', 720, 10.17),
    mapVoucherLine('CAS05', 1710, 10.17), mapVoucherLine('CAS06', 630, 12.07), mapVoucherLine('CAS07', 1050, 12.07),
    mapVoucherLine('CAS08', 1190, 12.07), mapVoucherLine('CAS09', 385, 13.05), mapVoucherLine('CAS10', 840, 7.03),
    mapVoucherLine('CAS11', 420, 12.07), mapVoucherLine('CAS12', 720, 10.17)
  ]},
  { id: 'GRV002249', timestamp: new Date('2025/03/17').getTime(), totalValue: 57714.25, tier: TierLevel.TRADE_WHOLESALE, items: [
    mapVoucherLine('CAS01', 1680, 7.03), mapVoucherLine('CAS02', 990, 10.17), mapVoucherLine('CAS03', 450, 10.17),
    mapVoucherLine('CAS04', 990, 10.17), mapVoucherLine('CAS05', 450, 10.17), mapVoucherLine('CAS06', 350, 12.07),
    mapVoucherLine('CAS09', 275, 13.05), mapVoucherLine('CAS12', 450, 10.17), mapVoucherLine('CAS15', 350, 12.07)
  ]},
  { id: 'GRV002273', timestamp: new Date('2025/03/25').getTime(), totalValue: 65119.40, tier: TierLevel.TRADE_WHOLESALE, items: [
    mapVoucherLine('CAS01', 720, 7.03), mapVoucherLine('CAS02', 2610, 10.17), mapVoucherLine('CAS04', 2610, 10.17),
    mapVoucherLine('CAS05', 270, 10.17), mapVoucherLine('CAS15', 350, 12.07)
  ]}
];

const App: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<TierLevel>(TierLevel.NONE);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showCompliance, setShowCompliance] = useState(false);
  const [showAssist, setShowAssist] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('REGISTRY');
  const [orderHistory, setOrderHistory] = useState<TransactionRecord[]>(MOCK_HISTORY);

  useEffect(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setQuantities(parsed.quantities || {});
        setSelectedTier(parsed.tier || TierLevel.NONE);
        console.log("Draft Inventory Registry Sync Completed.");
      } catch (e) { console.error("Draft Recover Fail"); }
    }

    const db = localStorage.getItem(DB_KEY);
    if (db) {
      try {
        const parsed = JSON.parse(db);
        if (parsed.length >= 1) setOrderHistory(parsed);
      } catch (e) { setOrderHistory(MOCK_HISTORY); }
    }
  }, []);

  const summary: OrderSummary = useMemo(() => {
    let totalBoxes = 0;
    let totalPieces = 0;
    let totalPacks = 0;
    let totalValue = 0;
    let failureCount = 0;
    const activeItems: OrderItem[] = [];

    if (selectedTier === TierLevel.NONE) {
      return { totalBoxes: 0, totalPieces: 0, totalPacks: 0, totalValue: 0, isAuthorized: false, failureCount: 0, activeItems: [] };
    }

    (Object.entries(quantities) as [string, number][]).forEach(([code, qty]) => {
      if (qty <= 0) return;
      const item = INVENTORY_REGISTRY.find(i => i.code === code);
      if (!item) return;

      const price = selectedTier === TierLevel.FACTORY_BULK ? item.tier1Price :
                    selectedTier === TierLevel.TRADE_WHOLESALE ? item.tier2Price :
                    item.tier3Price;

      const boxValue = item.boxMeterage * price;
      const itemTotalValue = qty * boxValue;
      const itemPieces = (item.boxMeterage / 2) * qty;
      const itemPacks = item.packsPerBox * qty;

      let isVerified = false;
      let statusMsg = '';

      if (selectedTier === TierLevel.FACTORY_BULK) {
        isVerified = itemTotalValue >= 29000;
        statusMsg = isVerified ? "PROFILE VERIFIED" : "INEFFICIENT VOLUME";
      } else if (selectedTier === TierLevel.TRADE_WHOLESALE) {
        isVerified = itemTotalValue >= 14500;
        statusMsg = isVerified ? "PROFILE VERIFIED" : "INEFFICIENT VOLUME";
      } else if (selectedTier === TierLevel.STANDARD_RETAIL) {
        isVerified = qty >= 2;
        statusMsg = isVerified ? "PROFILE VERIFIED" : "INEFFICIENT VOLUME";
      }

      if (!isVerified) failureCount++;
      totalBoxes += qty;
      totalPieces += itemPieces;
      totalPacks += itemPacks;
      totalValue += itemTotalValue;

      activeItems.push({
        code,
        quantity: qty,
        item,
        value: itemTotalValue,
        pieces: itemPieces,
        packs: itemPacks,
        isVerified,
        statusMsg
      });
    });

    return {
      totalBoxes, totalPieces, totalPacks, totalValue, 
      isAuthorized: activeItems.length > 0 && failureCount === 0,
      failureCount, activeItems
    };
  }, [quantities, selectedTier]);

  const handleTierSelect = (tier: TierLevel) => {
    if (selectedTier !== TierLevel.NONE && summary.totalBoxes > 0 && tier !== selectedTier) {
      if (!confirm("WARNING: Changing pricing tier will re-evaluate all current selections. Proceed?")) return;
    }
    setSelectedTier(tier);
  };

  const handleQtyChange = (code: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [code]: Math.max(0, qty) }));
  };

  const handleBulkQtyChange = (updates: Record<string, number>) => {
    setQuantities(updates);
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quantities, tier: selectedTier }));
      console.log("Registry Draft Persisted Successfully.");
      alert("Industrial Selection Draft Saved.");
    } catch (err) {
      console.error("Save Draft Failure:", err);
      alert("SYNC ERROR: Local storage threshold reached or disabled.");
    }
  };

  const handleReset = () => {
    if (confirm("DANGER: This will wipe all current selections. Clear registry?")) {
      console.log("Registry Wipe Initiated...");
      setQuantities({});
      setSearchTerm('');
      setSelectedTier(TierLevel.NONE);
      localStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleArchiveOrder = () => {
    if (!summary.isAuthorized) {
        alert("Compliance Gate Locked: Resolve MOQ violations before committing to vault.");
        return;
    }
    const newRecord: TransactionRecord = {
      id: `GRV-AUTO-${Date.now()}`,
      timestamp: Date.now(),
      items: summary.activeItems,
      totalValue: summary.totalValue,
      tier: selectedTier
    };
    const updatedHistory = [newRecord, ...orderHistory];
    setOrderHistory(updatedHistory);
    localStorage.setItem(DB_KEY, JSON.stringify(updatedHistory));
    setQuantities({});
    localStorage.removeItem(STORAGE_KEY);
    alert("Transaction committed to secure Audit Vault.");
  };

  const projectAllDemand = () => {
    if (selectedTier === TierLevel.NONE) {
      alert("SELECT PRICING TIER FIRST.");
      return;
    }
    
    const historicalMoverCodes = new Set<string>();
    orderHistory.forEach(txn => {
      txn.items.forEach(item => historicalMoverCodes.add(item.code));
    });

    const newQuantities: Record<string, number> = {};
    INVENTORY_REGISTRY.forEach(item => {
      if (historicalMoverCodes.has(item.code)) {
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

        if (targetQty > 0) newQuantities[item.code] = targetQty;
      }
    });

    setQuantities(newQuantities);
    alert("Global Intelligence Projection Applied Successfully.");
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'VAULT': return <AuditVault history={orderHistory} onBack={() => setViewMode('REGISTRY')} />;
      case 'INTELLIGENCE': return <AnalyticsDashboard history={orderHistory} onBack={() => setViewMode('REGISTRY')} onAssistClick={() => setShowAssist(true)} />;
      case 'AD_GENERATOR': return <AdGenerator onBack={() => setViewMode('REGISTRY')} />;
      default: return (
        <>
          <div className="no-print">
            <TierSelection 
              selectedTier={selectedTier} 
              onSelect={handleTierSelect} 
              hasSelections={summary.totalBoxes > 0} 
              onProjectAll={projectAllDemand}
            />
            <IntelligenceDeployment onProjectAll={projectAllDemand} />
            <PriorityMarketLeaders quantities={quantities} onQtyChange={handleQtyChange} history={orderHistory} selectedTier={selectedTier} />
            
            <div className="mb-8 max-w-full">
               <input 
                type="text" 
                placeholder="Search SKU profile registry..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 outline-none focus:border-blue-500 font-bold italic shadow-inner"
               />
            </div>

            <Catalog 
              items={INVENTORY_REGISTRY} 
              searchTerm={searchTerm} 
              selectedTier={selectedTier} 
              quantities={quantities} 
              onQtyChange={handleQtyChange} 
              onBulkQtyChange={handleBulkQtyChange}
              activeOrderItems={summary.activeItems} 
              history={orderHistory} 
            />
          </div>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-48">
      <Header 
        onIntelligenceClick={() => setViewMode('INTELLIGENCE')}
        onVaultClick={() => setViewMode('VAULT')}
        onRegistryClick={() => setViewMode('REGISTRY')}
        onAdGeneratorClick={() => setViewMode('AD_GENERATOR')}
        onAssistClick={() => setShowAssist(true)}
        selectedTier={selectedTier}
        summary={summary}
        viewMode={viewMode}
      />
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-12 w-full">
        {renderContent()}
      </main>
      <FloatingDashboard 
        summary={summary} 
        onComplianceToggle={() => setShowCompliance(true)} 
        onReset={handleReset} 
        onSaveDraft={handleSaveDraft}
        onCommit={handleArchiveOrder}
      />
      {showCompliance && <ComplianceModal summary={summary} onClose={() => setShowCompliance(false)} />}
      <FruitfulAssist isOpen={showAssist} onClose={() => setShowAssist(false)} history={orderHistory} />
    </div>
  );
};

export default App;
