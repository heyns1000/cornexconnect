
import { PricingItem, OrderItem, TierLevel } from '../types.ts';

/**
 * MASTER EXPORT UTILITY - CORNEXCONNECT™ LOGISTICS
 * Uses Blob-based triggers for maximum browser compatibility.
 */
export const downloadCSV = (rows: string[][], filename: string) => {
  try {
    const csvContent = rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank"; // Safety for some browser security models
    document.body.appendChild(link);
    link.click();
    
    // Slight delay before cleanup to ensure the click event processes
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("CSV Generation Failed:", error);
    alert("Industrial Export Node Failure. Check storage permissions.");
  }
};

export const exportOrderManifestToCSV = (items: OrderItem[], totalValue: number) => {
  if (!items || items.length === 0) return;
  
  const header = ["SKU Code", "Description", "Boxes", "Pieces", "Packs", "Rate/m", "Total Value (Ex VAT)"];
  const rows = items.map(item => {
    const rate = item.value / item.item.boxMeterage / item.quantity;
    return [
      item.code,
      item.item.name,
      item.quantity.toString(),
      item.pieces.toString(),
      item.packs.toString(),
      rate.toFixed(2),
      item.value.toFixed(2)
    ];
  });

  rows.push(["", "", "", "", "", "TOTAL GROSS", totalValue.toFixed(2)]);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadCSV([header, ...rows], `CornexConnect-Manifest-${timestamp}.csv`);
};

export const exportPricelistToCSV = (items: PricingItem[], tier: TierLevel) => {
  const header = ["SKU Code", "Profile Name", "Category", "Dimensions", "Box Meterage", "Packs/Box", "Active Rate (Ex VAT)"];
  const rows = items.map(item => {
    const price = tier === TierLevel.FACTORY_BULK ? item.tier1Price :
                  tier === TierLevel.TRADE_WHOLESALE ? item.tier2Price :
                  item.tier3Price;
    return [
      item.code,
      item.name,
      item.category,
      item.dimensions,
      item.boxMeterage.toString(),
      item.packsPerBox.toString(),
      price.toFixed(2)
    ];
  });
  
  const tierName = TierLevel[tier] || 'Standard';
  downloadCSV([header, ...rows], `CornexConnect-Pricelist-${tierName}.csv`);
};

export const exportFullPricelistToCSV = (items: PricingItem[]) => {
  const header = [
    "SKU Code", 
    "Profile Name", 
    "Category", 
    "Dimensions", 
    "Box Meterage", 
    "Packs/Box", 
    "Tier 1 (Factory Bulk)", 
    "Tier 2 (Trade Wholesale)", 
    "Tier 3 (Standard Retail)"
  ];
  
  const rows = items.map(item => [
    item.code,
    item.name,
    item.category,
    item.dimensions,
    item.boxMeterage.toString(),
    item.packsPerBox.toString(),
    item.tier1Price.toFixed(2),
    item.tier2Price.toFixed(2),
    item.tier3Price.toFixed(2)
  ]);
  
  downloadCSV([header, ...rows], `CornexConnect-Complete-Master-Pricelist-2026.csv`);
};
