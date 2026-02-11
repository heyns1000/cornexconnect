/**
 * CornexConnect Real Client Data Service
 *
 * Serves 3,267 real hardware stores extracted from Homemart spreadsheets.
 * Data flows transparently across all pages: Dashboard, Store Map, Routes, BI, Hardware Stores.
 *
 * Sources:
 * - Homemart Customer List "Complete sheet" (3,452 rows)
 * - Homemart Customer List "route plans" (2,530 rows)
 * - MERGED SHEET (4,176 rows)
 * - INDEPENDANT NW AND MP (151 rows)
 * - Hardware list (126 rows)
 * - CLIENTS VISITED (220 entries)
 * - Buildmart pricing (21 entries)
 */

import rawData from './realClientData.json';

// Province name normalization map (fixes typos in original data)
const PROVINCE_NORMALIZE: Record<string, string> = {
  'GAUTENG': 'Gauteng',
  'LIMPOPO': 'Limpopo',
  'KWAZULU-NATAL': 'KwaZulu-Natal',
  'KWA ZULU NATAL': 'KwaZulu-Natal',
  'KWA-ZULU NATAL': 'KwaZulu-Natal',
  'EKWA-ZULU NATAL': 'KwaZulu-Natal',
  'MPUMALANGA': 'Mpumalanga',
  'MPUMULANGA': 'Mpumalanga',
  'PMUMALANGA': 'Mpumalanga',
  'WESTERN CAPE': 'Western Cape',
  'WESTERN CAP': 'Western Cape',
  'WESTER CAPE': 'Western Cape',
  'EASTERN CAPE': 'Eastern Cape',
  'EASTERB CAPE': 'Eastern Cape',
  'EAST LONDON': 'Eastern Cape',
  'PORT ELIZABETH': 'Eastern Cape',
  'QUEENSTOWN': 'Eastern Cape',
  'NORTH WEST': 'North West',
  'NORTH WEST PROVINCE': 'North West',
  'FREE STATE': 'Free State',
  'FREE-STATE': 'Free State',
  'FREESTATE': 'Free State',
  'NORTHERN CAPE': 'Northern Cape',
  'NOTHERN CAPE': 'Northern Cape',
  'JOHANNESBURG': 'Gauteng',
  // International
  'BOTSWANA': 'Botswana',
  'NAMIBIA': 'Namibia',
  'LESOTHO': 'Lesotho',
  'SWAZILAND': 'Eswatini',
  'ZIMBABWE': 'Zimbabwe',
  'ZAMBIA': 'Zambia',
  'MALAWI': 'Malawi',
  'MOZAMBIQUE': 'Mozambique',
};

// SA Province colors for heatmap
export const PROVINCE_COLORS: Record<string, string> = {
  'Gauteng': '#10b981',        // emerald
  'Limpopo': '#f59e0b',        // amber
  'KwaZulu-Natal': '#3b82f6',  // blue
  'Mpumalanga': '#8b5cf6',     // violet
  'Western Cape': '#06b6d4',   // cyan
  'Eastern Cape': '#ef4444',   // red
  'North West': '#f97316',     // orange
  'Free State': '#ec4899',     // pink
  'Northern Cape': '#84cc16',  // lime
  // International
  'Botswana': '#14b8a6',
  'Namibia': '#a855f7',
  'Lesotho': '#64748b',
  'Eswatini': '#0ea5e9',
  'Zimbabwe': '#22c55e',
  'Zambia': '#e11d48',
  'Malawi': '#7c3aed',
  'Mozambique': '#059669',
};

// Province GPS coordinates (for map center points)
export const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  'Gauteng': { lat: -26.2041, lng: 28.0473 },
  'Limpopo': { lat: -23.4013, lng: 29.4179 },
  'KwaZulu-Natal': { lat: -29.6006, lng: 30.3794 },
  'Mpumalanga': { lat: -25.5653, lng: 30.5279 },
  'Western Cape': { lat: -33.9249, lng: 18.4241 },
  'Eastern Cape': { lat: -32.2968, lng: 26.4194 },
  'North West': { lat: -26.6639, lng: 25.2838 },
  'Free State': { lat: -29.0852, lng: 26.1596 },
  'Northern Cape': { lat: -29.0466, lng: 21.8569 },
  'Botswana': { lat: -24.6282, lng: 25.9231 },
  'Namibia': { lat: -22.5609, lng: 17.0658 },
  'Lesotho': { lat: -29.6100, lng: 28.2336 },
  'Eswatini': { lat: -26.5225, lng: 31.4659 },
  'Zimbabwe': { lat: -19.0154, lng: 29.1549 },
  'Zambia': { lat: -15.3875, lng: 28.3228 },
};

// City GPS coordinates for major cities
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'johannesburg': { lat: -26.2041, lng: 28.0473 },
  'pretoria': { lat: -25.7479, lng: 28.2293 },
  'cape town': { lat: -33.9249, lng: 18.4241 },
  'durban': { lat: -29.8587, lng: 31.0218 },
  'port elizabeth': { lat: -33.9608, lng: 25.6022 },
  'gqeberha': { lat: -33.9608, lng: 25.6022 },
  'bloemfontein': { lat: -29.0852, lng: 26.1596 },
  'nelspruit': { lat: -25.4753, lng: 30.9694 },
  'mbombela': { lat: -25.4753, lng: 30.9694 },
  'polokwane': { lat: -23.9045, lng: 29.4689 },
  'kimberley': { lat: -28.7282, lng: 24.7499 },
  'rustenburg': { lat: -25.6715, lng: 27.2420 },
  'east london': { lat: -33.0153, lng: 27.9116 },
  'pietermaritzburg': { lat: -29.6168, lng: 30.3928 },
  'benoni': { lat: -26.1879, lng: 28.3208 },
  'germiston': { lat: -26.2236, lng: 28.1694 },
  'soweto': { lat: -26.2485, lng: 27.8540 },
  'centurion': { lat: -25.8603, lng: 28.1894 },
  'midrand': { lat: -25.9923, lng: 28.1268 },
  'sandton': { lat: -26.1076, lng: 28.0567 },
  'randburg': { lat: -26.0936, lng: 28.0064 },
  'roodepoort': { lat: -26.1625, lng: 27.8625 },
  'alberton': { lat: -26.2667, lng: 28.1167 },
  'springs': { lat: -26.2525, lng: 28.4394 },
  'boksburg': { lat: -26.2125, lng: 28.2597 },
  'kempton park': { lat: -26.1000, lng: 28.2333 },
  'vanderbijlpark': { lat: -26.7167, lng: 27.8000 },
  'vereeniging': { lat: -26.6736, lng: 27.9264 },
  'van der bijl': { lat: -26.7167, lng: 27.8000 },
  'lenasia': { lat: -26.3229, lng: 27.8461 },
  'thohoyandou': { lat: -22.9500, lng: 30.4833 },
  'tzaneen': { lat: -23.8333, lng: 30.1500 },
  'mokopane': { lat: -24.1833, lng: 29.0167 },
  'louis trichardt': { lat: -23.0500, lng: 29.9000 },
  'giyani': { lat: -23.3000, lng: 30.7167 },
  'lebowakgomo': { lat: -24.2000, lng: 29.5000 },
  'witbank': { lat: -25.8800, lng: 29.2333 },
  'emalahleni': { lat: -25.8800, lng: 29.2333 },
  'secunda': { lat: -26.5333, lng: 29.2000 },
  'ermelo': { lat: -26.5333, lng: 29.9833 },
  'kwamhlanga': { lat: -25.4333, lng: 28.7333 },
  'brits': { lat: -25.6333, lng: 27.7833 },
  'klerksdorp': { lat: -26.8667, lng: 26.6667 },
  'potchefstroom': { lat: -26.7167, lng: 27.1000 },
  'mafikeng': { lat: -25.8500, lng: 25.6333 },
  'mahikeng': { lat: -25.8500, lng: 25.6333 },
  'vryburg': { lat: -26.9500, lng: 24.7333 },
  'welkom': { lat: -27.9833, lng: 26.7333 },
  'kroonstad': { lat: -27.6500, lng: 27.2333 },
  'sasolburg': { lat: -26.8167, lng: 27.8167 },
  'mthatha': { lat: -31.5889, lng: 28.7844 },
  'george': { lat: -33.9631, lng: 22.4614 },
  'stellenbosch': { lat: -33.9347, lng: 18.8662 },
  'paarl': { lat: -33.7342, lng: 18.9623 },
  'phoenix': { lat: -29.7000, lng: 31.0000 },
  'pinetown': { lat: -29.8167, lng: 30.8667 },
  'chatsworth': { lat: -29.9167, lng: 30.8833 },
  'gaborone': { lat: -24.6282, lng: 25.9231 },
  'windhoek': { lat: -22.5609, lng: 17.0658 },
  'maseru': { lat: -29.3167, lng: 27.4833 },
  'mbabane': { lat: -26.3167, lng: 31.1333 },
  'harare': { lat: -17.8292, lng: 31.0522 },
  'lusaka': { lat: -15.3875, lng: 28.3228 },
};

export interface Store {
  storeCode: string;
  storeName: string;
  area: string;
  city: string;
  province: string;
  streetAddress: string;
  group: string;
  isWholesaler: boolean;
  isActive: boolean;
  product: string;
  clientType: string;
  customerName: string;
  customerNumber: string;
  email: string;
  repName: string;
  lastVisitDate: string | null;
  daysSinceVisit: number | null;
  nextVisitDate: string | null;
  lastInvoiceDate: string | null;
  daysFromLastOrder: number | null;
  creditApp: string;
  customerComments: string;
  happyAngry: string;
  storeType: string;
  storeSize: string;
  source: string;
  // Computed
  normalizedProvince: string;
  lat: number | null;
  lng: number | null;
}

export interface SalesRep {
  empId: string;
  name: string;
  storeCount: number;
  provinces: string[];
  territories: string[];
  cities: string[];
}

export interface RetailGroup {
  name: string;
  storeCount: number;
  provinces: string[];
}

export interface Province {
  name: string;
  storeCount: number;
  activeCount: number;
  cityCount: number;
  cities: string[];
}

export interface Territory {
  name: string;
  province: string;
  storeCount: number;
  reps: string[];
}

export interface Top40Customer {
  rank: number;
  companyName: string;
  province: string;
  lastInvoiceDate: string | null;
  corniceManufacturer: string;
}

export interface VisitLogEntry {
  storeName: string;
  contactName: string;
  telephone: string;
  lastVisitDate: string | null;
  repVisited: string;
  lastInvoicedDate: string | null;
}

// Normalize all stores
function normalizeStores(raw: any[]): Store[] {
  return raw.map(s => {
    const normalizedProvince = PROVINCE_NORMALIZE[s.province] || s.province;
    const cityKey = (s.city || '').toLowerCase();
    const coords = CITY_COORDS[cityKey] || PROVINCE_COORDS[normalizedProvince] || null;

    return {
      ...s,
      normalizedProvince,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    };
  });
}

// Pre-process data once
const stores = normalizeStores(rawData.stores);

// Normalize province names in derived data
const provinces: Province[] = (() => {
  const pMap = new Map<string, Province>();
  for (const store of stores) {
    const p = store.normalizedProvince;
    if (!pMap.has(p)) {
      pMap.set(p, { name: p, storeCount: 0, activeCount: 0, cityCount: 0, cities: [] });
    }
    const entry = pMap.get(p)!;
    entry.storeCount++;
    if (store.isActive) entry.activeCount++;
    if (!entry.cities.includes(store.city) && store.city) entry.cities.push(store.city);
  }
  for (const [, p] of pMap) {
    p.cityCount = p.cities.length;
  }
  return Array.from(pMap.values()).sort((a, b) => b.storeCount - a.storeCount);
})();

// Normalize territories
const territories: Territory[] = (() => {
  const tMap = new Map<string, Territory>();
  for (const store of stores) {
    const area = store.area || store.city;
    if (!area || area.length < 2) continue;
    const key = area.toLowerCase();
    if (!tMap.has(key)) {
      tMap.set(key, { name: area, province: store.normalizedProvince, storeCount: 0, reps: [] });
    }
    const entry = tMap.get(key)!;
    entry.storeCount++;
    if (store.repName && !entry.reps.includes(store.repName)) {
      entry.reps.push(store.repName);
    }
  }
  return Array.from(tMap.values()).sort((a, b) => b.storeCount - a.storeCount);
})();

// ============================================================
// PUBLIC API - used across all pages
// ============================================================

export function getAllStores(): Store[] {
  return stores;
}

export function getStoresByProvince(province: string): Store[] {
  return stores.filter(s => s.normalizedProvince === province);
}

export function getStoresByRep(repName: string): Store[] {
  return stores.filter(s => s.repName.toLowerCase() === repName.toLowerCase());
}

export function getStoresByGroup(group: string): Store[] {
  return stores.filter(s => s.group.toLowerCase().includes(group.toLowerCase()));
}

export function getStoresByCity(city: string): Store[] {
  return stores.filter(s => s.city.toLowerCase().includes(city.toLowerCase()));
}

export function searchStores(query: string): Store[] {
  const q = query.toLowerCase();
  return stores.filter(s =>
    s.storeName.toLowerCase().includes(q) ||
    s.city.toLowerCase().includes(q) ||
    s.area.toLowerCase().includes(q) ||
    s.customerName.toLowerCase().includes(q) ||
    s.group.toLowerCase().includes(q) ||
    s.repName.toLowerCase().includes(q)
  );
}

export function getProvinces(): Province[] {
  return provinces;
}

export function getSAProvinces(): Province[] {
  const saProvs = ['Gauteng', 'Limpopo', 'KwaZulu-Natal', 'Mpumalanga', 'Western Cape', 'Eastern Cape', 'North West', 'Free State', 'Northern Cape'];
  return provinces.filter(p => saProvs.includes(p.name));
}

export function getInternationalRegions(): Province[] {
  const saProvs = ['Gauteng', 'Limpopo', 'KwaZulu-Natal', 'Mpumalanga', 'Western Cape', 'Eastern Cape', 'North West', 'Free State', 'Northern Cape'];
  return provinces.filter(p => !saProvs.includes(p.name));
}

export function getTerritories(): Territory[] {
  return territories;
}

export function getTerritoriesByProvince(province: string): Territory[] {
  return territories.filter(t => t.province === province);
}

export function getSalesReps(): SalesRep[] {
  return rawData.salesReps as SalesRep[];
}

export function getRetailGroups(): RetailGroup[] {
  return rawData.retailGroups as RetailGroup[];
}

export function getTop40Customers(): Top40Customer[] {
  return rawData.top40Customers as Top40Customer[];
}

export function getVisitLog(): VisitLogEntry[] {
  return rawData.visitLog as VisitLogEntry[];
}

export function getPricing(): any[] {
  return rawData.pricing;
}

export function getStats() {
  const saProvs = ['Gauteng', 'Limpopo', 'KwaZulu-Natal', 'Mpumalanga', 'Western Cape', 'Eastern Cape', 'North West', 'Free State', 'Northern Cape'];
  const saStores = stores.filter(s => saProvs.includes(s.normalizedProvince));
  const intlStores = stores.filter(s => !saProvs.includes(s.normalizedProvince));

  return {
    totalStores: stores.length,
    activeStores: stores.filter(s => s.isActive).length,
    saStores: saStores.length,
    internationalStores: intlStores.length,
    totalProvinces: getSAProvinces().length,
    internationalRegions: getInternationalRegions().length,
    totalCities: new Set(stores.map(s => s.city)).size,
    totalTerritories: territories.length,
    totalSalesReps: rawData.salesReps.length,
    totalRetailGroups: rawData.retailGroups.length,
    wholesalers: stores.filter(s => s.isWholesaler).length,
    chainStores: stores.filter(s => s.storeType === 'chain').length,
    franchiseStores: stores.filter(s => s.storeType === 'franchise').length,
    independentStores: stores.filter(s => s.storeType === 'independent').length,
    storesWithEmail: stores.filter(s => s.email).length,
    storesWithRep: stores.filter(s => s.repName).length,
    top40Count: rawData.top40Customers.length,
  };
}

// Province heatmap data for visualization
export function getProvinceHeatmap() {
  return getSAProvinces().map(p => ({
    name: p.name,
    storeCount: p.storeCount,
    activeCount: p.activeCount,
    cityCount: p.cityCount,
    color: PROVINCE_COLORS[p.name] || '#6b7280',
    coords: PROVINCE_COORDS[p.name],
    percentage: Math.round((p.storeCount / stores.length) * 100),
  }));
}

// Rep performance data
export function getRepPerformance() {
  return (rawData.salesReps as SalesRep[]).map(rep => {
    const repStores = getStoresByRep(rep.name);
    const activeStores = repStores.filter(s => s.isActive);
    const withVisits = repStores.filter(s => s.lastVisitDate);

    return {
      ...rep,
      activeStores: activeStores.length,
      totalStores: repStores.length,
      visitRate: repStores.length > 0 ? Math.round((withVisits.length / repStores.length) * 100) : 0,
      provinces: rep.provinces.map(p => PROVINCE_NORMALIZE[p] || p),
    };
  }).sort((a, b) => b.totalStores - a.totalStores);
}
