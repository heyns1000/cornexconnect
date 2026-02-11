const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Province normalization map
const PROVINCE_MAP = {
  'GAUTENG': 'GAUTENG', 'Gauteng': 'GAUTENG', 'GP': 'GAUTENG',
  'LIMPOPO': 'LIMPOPO', 'Limpopo': 'LIMPOPO', 'POLOKWANE': 'LIMPOPO',
  'KWAZULU-NATAL': 'KWAZULU-NATAL', 'Kwa-Zulu Natal': 'KWAZULU-NATAL', 'KZN': 'KWAZULU-NATAL', 'Ekwa-Zulu Natal': 'KWAZULU-NATAL',
  'WESTERN CAPE': 'WESTERN CAPE', 'Western Cape': 'WESTERN CAPE', 'Wester Cape': 'WESTERN CAPE', 'WESTERN CAP': 'WESTERN CAPE', 'CAPE TOWN': 'WESTERN CAPE', 'Cape Town': 'WESTERN CAPE',
  'EASTERN CAPE': 'EASTERN CAPE', 'Eastern Cape': 'EASTERN CAPE', 'EAST LONDON': 'EASTERN CAPE', 'East London': 'EASTERN CAPE', 'QUEENSTOWN': 'EASTERN CAPE', 'Port Elizabeth': 'EASTERN CAPE',
  'MPUMALANGA': 'MPUMALANGA', 'Mpumalanga': 'MPUMALANGA', 'MPUMULANGA': 'MPUMALANGA', 'PMUMALANGA': 'MPUMALANGA',
  'NORTH WEST': 'NORTH WEST', 'North West': 'NORTH WEST', 'NORTH WEST PROVINCE': 'NORTH WEST', 'North West Province': 'NORTH WEST',
  'FREE STATE': 'FREE STATE', 'Free State': 'FREE STATE', 'FREESTATE': 'FREE STATE', 'Free-State': 'FREE STATE',
  'NORTHERN CAPE': 'NORTHERN CAPE', 'Northern Cape': 'NORTHERN CAPE',
  'BOTSWANA': 'BOTSWANA', 'Botswana': 'BOTSWANA',
  'NAMIBIA': 'NAMIBIA', 'Namibia': 'NAMIBIA',
  'LESOTHO': 'LESOTHO', 'Lesotho': 'LESOTHO',
  'SWAZILAND': 'ESWATINI', 'Swaziland': 'ESWATINI',
  'ZIMBABWE': 'ZIMBABWE',
  'ZAMBIA': 'ZAMBIA',
  'MOZAMBIQUE': 'MOZAMBIQUE',
  'MALAWI': 'MALAWI',
};

function normalizeProvince(raw) {
  if (!raw) return 'UNKNOWN';
  return PROVINCE_MAP[raw.trim()] || raw.trim().toUpperCase();
}

function determineStoreSize(name) {
  const n = name.toLowerCase();
  if (n.includes('mega') || n.includes('warehouse') || n.includes('depot') || n.includes('build it') || n.includes('cashbuild') || n.includes('makro')) return 'large';
  if (n.includes('center') || n.includes('builders') || n.includes('hardware') || n.includes('mica') || n.includes('buco')) return 'medium';
  return 'small';
}

function determineStoreType(name, group) {
  const n = name.toLowerCase();
  const g = (group || '').toLowerCase();
  if (n.includes('build it') || n.includes('cashbuild') || n.includes('makro') || g.includes('est') || g.includes('makro')) return 'chain';
  if (n.includes('mica') || n.includes('buco') || g.includes('mica') || g.includes('buco') || g.includes('diy')) return 'franchise';
  return 'independent';
}

function determineCreditRating(name, group) {
  const n = name.toLowerCase();
  const g = (group || '').toLowerCase();
  if (n.includes('mega') || n.includes('build it') || n.includes('warehouse') || g.includes('est') || g.includes('makro')) return 'A+';
  if (n.includes('builders') || n.includes('hardware') || n.includes('mica') || g.includes('mica') || g.includes('buco')) return 'A';
  if (n.includes('center') || n.includes('supplies')) return 'B+';
  return 'B';
}

function determineMonthlyPotential(size, province) {
  const base = { 'large': 65000, 'medium': 38000, 'small': 19000 }[size] || 20000;
  const mult = {
    'GAUTENG': 1.3, 'WESTERN CAPE': 1.2, 'KWAZULU-NATAL': 1.15,
    'EASTERN CAPE': 0.95, 'LIMPOPO': 0.85, 'NORTH WEST': 0.88,
    'MPUMALANGA': 0.92, 'FREE STATE': 0.85, 'NORTHERN CAPE': 0.75,
    'BOTSWANA': 0.7, 'NAMIBIA': 0.7, 'LESOTHO': 0.6, 'ESWATINI': 0.6,
    'ZIMBABWE': 0.55, 'ZAMBIA': 0.5, 'MOZAMBIQUE': 0.5, 'MALAWI': 0.45
  }[province] || 0.8;
  return Math.round(base * mult);
}

// ========== MAIN EXTRACTION ==========

const allStores = [];
const seenNames = new Set();
let storeNum = 1000;

// 1. MERGED SHEET - main hardware store data (4176 rows)
try {
  const wb = XLSX.readFile('attached_assets/MERGED SHEET_1754172955402.xlsx');
  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log('MERGED SHEET: ' + data.length + ' rows');
  for (const row of data) {
    const storeName = String(row['STORE NAME'] || '').trim();
    if (!storeName || storeName.length <= 2 || storeName.toLowerCase().includes('total') || seenNames.has(storeName.toUpperCase())) continue;
    seenNames.add(storeName.toUpperCase());
    storeNum++;
    const province = normalizeProvince(row['PROVINCE']);
    const group = String(row['GROUP'] || '').trim();
    allStores.push({
      storeCode: 'CC' + storeNum.toString().padStart(4, '0'),
      storeName, province,
      city: String(row['CITY'] || '').trim(),
      territory: String(row['AREA'] || '').trim(),
      address: String(row['STREET ADDRESS'] || '').trim(),
      ownerName: String(row['CUSTOMER NAME'] || '').trim(),
      contactPerson: String(row['CUSTOMER NAME'] || '').trim(),
      customerNumber: String(row['CUSTOMER NUMBER'] || '').trim(),
      retailGroup: group,
      storeSize: determineStoreSize(storeName),
      storeType: determineStoreType(storeName, group),
      creditRating: determineCreditRating(storeName, group),
      monthlyPotential: determineMonthlyPotential(determineStoreSize(storeName), province),
      phone: '', email: '', isActive: true, source: 'MERGED_SHEET'
    });
  }
} catch(e) { console.error('MERGED SHEET error:', e.message); }

// 2. Hardware list (126 rows)
try {
  const wb = XLSX.readFile('attached_assets/Hardware list_1754172955406.xlsx');
  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log('Hardware list: ' + data.length + ' rows');
  for (const row of data) {
    const storeName = String(row['STORE NAME'] || '').trim();
    if (!storeName || storeName.length <= 2 || seenNames.has(storeName.toUpperCase())) continue;
    seenNames.add(storeName.toUpperCase());
    storeNum++;
    const province = normalizeProvince(row['PROVINCE']);
    allStores.push({
      storeCode: 'CC' + storeNum.toString().padStart(4, '0'),
      storeName, province,
      city: String(row['CITY'] || '').trim(),
      territory: String(row['AREA'] || '').trim(),
      address: String(row['STREET ADDRESS'] || '').trim(),
      ownerName: String(row['CUSTOMER NAME'] || '').trim(),
      contactPerson: String(row['CUSTOMER NAME'] || '').trim(),
      customerNumber: '',
      retailGroup: '',
      storeSize: determineStoreSize(storeName),
      storeType: determineStoreType(storeName, ''),
      creditRating: determineCreditRating(storeName, ''),
      monthlyPotential: determineMonthlyPotential(determineStoreSize(storeName), province),
      phone: '', email: '', isActive: true, source: 'HARDWARE_LIST'
    });
  }
} catch(e) { console.error('Hardware list error:', e.message); }

// 3. Homemart Customer Lists
try {
  const wb = XLSX.readFile('attached_assets/Homemart Customer List_1755027738205.xlsx');
  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log('Homemart: ' + data.length + ' rows');
  for (const row of data) {
    const storeName = String(row['Company Name'] || '').trim();
    if (!storeName || storeName.length <= 2 || seenNames.has(storeName.toUpperCase())) continue;
    seenNames.add(storeName.toUpperCase());
    storeNum++;
    const province = normalizeProvince(row['PROVINCE']);
    allStores.push({
      storeCode: 'HM' + storeNum.toString().padStart(4, '0'),
      storeName, province,
      city: '', territory: '', address: '',
      ownerName: '', contactPerson: '',
      customerNumber: '',
      retailGroup: 'HOMEMART',
      storeSize: 'medium',
      storeType: 'franchise',
      creditRating: 'A',
      monthlyPotential: determineMonthlyPotential('medium', province),
      phone: '', email: '', isActive: true, source: 'HOMEMART'
    });
  }
} catch(e) { console.error('Homemart error:', e.message); }

// 4. INDEPENDANT NW AND MP
try {
  const wb = XLSX.readFile('attached_assets/INDEPENDANT NW AND MP_1755027738205.xlsx');
  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log('INDEPENDANT NW AND MP: ' + data.length + ' rows');
  for (const row of data) {
    const storeName = String(row['STORE NAME'] || '').trim();
    if (!storeName || storeName.length <= 2 || seenNames.has(storeName.toUpperCase())) continue;
    seenNames.add(storeName.toUpperCase());
    storeNum++;
    const province = normalizeProvince(row['PROVINCE']);
    const group = String(row['GROUP'] || '').trim();
    allStores.push({
      storeCode: 'IN' + storeNum.toString().padStart(4, '0'),
      storeName, province,
      city: String(row['CITY'] || '').trim(),
      territory: String(row['AREA'] || '').trim(),
      address: String(row['STREET ADDRESS'] || '').trim(),
      ownerName: String(row['CUSTOMER NAME'] || '').trim(),
      contactPerson: String(row['CUSTOMER NAME'] || '').trim(),
      customerNumber: String(row['CUSTOMER NUMBER'] || '').trim(),
      retailGroup: group,
      storeSize: determineStoreSize(storeName),
      storeType: determineStoreType(storeName, group),
      creditRating: determineCreditRating(storeName, group),
      monthlyPotential: determineMonthlyPotential(determineStoreSize(storeName), province),
      phone: '', email: '', isActive: true, source: 'INDEPENDANT_NW_MP'
    });
  }
} catch(e) { console.error('INDEPENDANT error:', e.message); }

// 5. CLIENTS VISITED (has rep data!)
const repMap = {};
try {
  const wb = XLSX.readFile('attached_assets/CLIENTS VISITED_1754173774351.xls');
  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log('CLIENTS VISITED: ' + data.length + ' rows');
  for (const row of data) {
    const storeName = String(row['Name'] || '').trim();
    const rep = String(row['REP VISITED'] || '').trim();
    const contact = String(row['Contact Name'] || '').trim();
    const phone = String(row['Telephone'] || '').trim();
    if (rep) repMap[storeName.toUpperCase()] = rep;
    if (!storeName || storeName.length <= 2 || seenNames.has(storeName.toUpperCase())) {
      // Update existing store with rep/contact info
      const existing = allStores.find(s => s.storeName.toUpperCase() === storeName.toUpperCase());
      if (existing) {
        if (rep) existing.salesRep = rep;
        if (contact) existing.contactPerson = contact;
        if (phone) existing.phone = phone;
      }
      continue;
    }
    seenNames.add(storeName.toUpperCase());
    storeNum++;
    allStores.push({
      storeCode: 'CV' + storeNum.toString().padStart(4, '0'),
      storeName, province: 'GAUTENG',
      city: '', territory: '', address: '',
      ownerName: contact, contactPerson: contact,
      customerNumber: '', retailGroup: '',
      salesRep: rep,
      storeSize: determineStoreSize(storeName),
      storeType: determineStoreType(storeName, ''),
      creditRating: determineCreditRating(storeName, ''),
      monthlyPotential: determineMonthlyPotential(determineStoreSize(storeName), 'GAUTENG'),
      phone, email: '', isActive: true, source: 'CLIENTS_VISITED'
    });
  }
} catch(e) { console.error('CLIENTS VISITED error:', e.message); }

// Apply rep mapping to all matching stores
for (const store of allStores) {
  if (!store.salesRep && repMap[store.storeName.toUpperCase()]) {
    store.salesRep = repMap[store.storeName.toUpperCase()];
  }
}

// ========== STATISTICS ==========
const byProvince = {};
allStores.forEach(s => { byProvince[s.province] = (byProvince[s.province]||0)+1; });

const reps = [...new Set(allStores.filter(s => s.salesRep).map(s => s.salesRep))];
const groups = [...new Set(allStores.filter(s => s.retailGroup).map(s => s.retailGroup))];
const territories = [...new Set(allStores.filter(s => s.territory).map(s => s.territory))];
const cities = [...new Set(allStores.filter(s => s.city).map(s => s.city))];

console.log('\n========== EXTRACTION COMPLETE ==========');
console.log('Total unique stores: ' + allStores.length);
console.log('\nBy Province:');
Object.entries(byProvince).sort((a,b) => b[1]-a[1]).forEach(([p,c]) => console.log('  ' + p + ': ' + c));
console.log('\nSales Reps: ' + reps.join(', '));
console.log('Retail Groups (' + groups.length + '): ' + groups.join(', '));
console.log('Territories: ' + territories.length);
console.log('Cities: ' + cities.length);

// Write comprehensive JSON
const output = {
  metadata: {
    totalStores: allStores.length,
    extractedAt: new Date().toISOString(),
    provinces: Object.keys(byProvince).length,
    territories: territories.length,
    cities: cities.length,
    retailGroups: groups.length,
    salesReps: reps.length,
    byProvince,
    sources: ['MERGED_SHEET', 'HARDWARE_LIST', 'HOMEMART', 'INDEPENDANT_NW_MP', 'CLIENTS_VISITED']
  },
  salesReps: reps,
  retailGroups: groups,
  territories: territories.sort(),
  stores: allStores
};

fs.writeFileSync('server/extracted-stores.json', JSON.stringify(output, null, 2));
console.log('\nWrote server/extracted-stores.json (' + Math.round(fs.statSync('server/extracted-stores.json').size/1024) + ' KB)');
