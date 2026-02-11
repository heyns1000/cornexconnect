const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Extract ALL real data from spreadsheets into a comprehensive seed data file
function extractAllData() {
  const assetsDir = path.join(__dirname, '..', 'attached_assets');

  // ============================================================
  // 1. EXTRACT FROM "Homemart Customer List (1)" - THE RICHEST FILE
  // ============================================================
  const hmFile = path.join(assetsDir, 'Homemart Customer List (1)_1755027266574.xlsx');
  const hmWb = XLSX.readFile(hmFile);

  // Complete sheet (3,452 rows - master customer list)
  const completeSheet = XLSX.utils.sheet_to_json(hmWb.Sheets['Complete sheet'] || hmWb.Sheets[hmWb.SheetNames[1]]);
  console.log(`Complete sheet: ${completeSheet.length} rows`);

  // Route plans (2,530 rows - active route plans)
  const routePlans = XLSX.utils.sheet_to_json(hmWb.Sheets['route plans'] || hmWb.Sheets[hmWb.SheetNames[0]]);
  console.log(`Route plans: ${routePlans.length} rows`);

  // Top 40 priority customers
  const top40 = XLSX.utils.sheet_to_json(hmWb.Sheets['TOP 40'] || hmWb.Sheets[hmWb.SheetNames[2]] || hmWb.Sheets[hmWb.SheetNames[0]]);
  console.log(`TOP 40: ${top40.length} rows`);

  // ============================================================
  // 2. EXTRACT FROM MERGED SHEET (4,176 rows - largest dataset)
  // ============================================================
  const mergedFile = path.join(assetsDir, 'MERGED SHEET_1754172955402.xlsx');
  const mergedWb = XLSX.readFile(mergedFile);
  const mergedData = XLSX.utils.sheet_to_json(mergedWb.Sheets[mergedWb.SheetNames[0]]);
  console.log(`MERGED SHEET: ${mergedData.length} rows`);

  // ============================================================
  // 3. EXTRACT FROM INDEPENDANT NW AND MP
  // ============================================================
  const indFile = path.join(assetsDir, 'INDEPENDANT NW AND MP_1755016203148.xlsx');
  const indWb = XLSX.readFile(indFile);
  const mpSheet = XLSX.utils.sheet_to_json(indWb.Sheets['MP'] || indWb.Sheets[indWb.SheetNames[0]]);
  const nwSheet = XLSX.utils.sheet_to_json(indWb.Sheets['Sheet2'] || indWb.Sheets[indWb.SheetNames[1]] || []);
  console.log(`INDEPENDANT MP: ${mpSheet.length} rows, NW: ${nwSheet.length} rows`);

  // ============================================================
  // 4. EXTRACT FROM HARDWARE LIST
  // ============================================================
  const hwFile = path.join(assetsDir, 'Hardware list_1754172955406.xlsx');
  const hwWb = XLSX.readFile(hwFile);
  const hwData = XLSX.utils.sheet_to_json(hwWb.Sheets[hwWb.SheetNames[0]]);
  console.log(`Hardware list: ${hwData.length} rows`);

  // ============================================================
  // 5. EXTRACT FROM CLIENTS VISITED
  // ============================================================
  const cvFile = path.join(assetsDir, 'CLIENTS VISITED_1754173774351.xls');
  const cvWb = XLSX.readFile(cvFile);
  const cvData = XLSX.utils.sheet_to_json(cvWb.Sheets[cvWb.SheetNames[0]]);
  console.log(`CLIENTS VISITED: ${cvData.length} rows`);

  // ============================================================
  // 6. EXTRACT FROM BUILDMART PRICING
  // ============================================================
  const bpFile = path.join(assetsDir, 'Buildmart pricing A_1754173404087.xlsx');
  const bpWb = XLSX.readFile(bpFile);
  const bpData = XLSX.utils.sheet_to_json(bpWb.Sheets[bpWb.SheetNames[0]]);
  console.log(`Buildmart pricing: ${bpData.length} rows`);

  // ============================================================
  // BUILD COMPREHENSIVE STORE DATABASE
  // ============================================================

  // Use Complete sheet as primary source (richest data)
  const storeMap = new Map();
  let storeCounter = 1;

  // Helper to normalize province names
  function normalizeProvince(p) {
    if (!p) return 'GAUTENG';
    const pUpper = String(p).trim().toUpperCase();
    const map = {
      'GP': 'GAUTENG', 'GAUTENG': 'GAUTENG', 'GUATENG': 'GAUTENG', 'GT': 'GAUTENG',
      'LP': 'LIMPOPO', 'LIMPOPO': 'LIMPOPO', 'POLOKWANE': 'LIMPOPO',
      'NW': 'NORTH WEST', 'NORTH WEST': 'NORTH WEST', 'NORTHWEST': 'NORTH WEST',
      'MP': 'MPUMALANGA', 'MPUMALANGA': 'MPUMALANGA',
      'WC': 'WESTERN CAPE', 'WESTERN CAPE': 'WESTERN CAPE', 'CAPE TOWN': 'WESTERN CAPE',
      'EC': 'EASTERN CAPE', 'EASTERN CAPE': 'EASTERN CAPE',
      'FS': 'FREE STATE', 'FREE STATE': 'FREE STATE', 'FREESTATE': 'FREE STATE',
      'KZN': 'KWAZULU-NATAL', 'KWAZULU-NATAL': 'KWAZULU-NATAL', 'KWAZULU NATAL': 'KWAZULU-NATAL',
      'NC': 'NORTHERN CAPE', 'NORTHERN CAPE': 'NORTHERN CAPE',
      'BOTSWANA': 'BOTSWANA', 'BW': 'BOTSWANA',
      'LESOTHO': 'LESOTHO', 'ZAMBIA': 'ZAMBIA', 'NAMIBIA': 'NAMIBIA',
    };
    return map[pUpper] || pUpper;
  }

  // Helper to get store key for deduplication
  function storeKey(name, city) {
    return `${String(name || '').trim().toLowerCase()}|${String(city || '').trim().toLowerCase()}`;
  }

  // Helper to convert Excel date serial to ISO string
  function excelDateToISO(serial) {
    if (!serial || typeof serial !== 'number' || serial < 1000) return null;
    const date = new Date((serial - 25569) * 86400 * 1000);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  }

  // Process Complete sheet first (richest data with rep info, visit dates, etc.)
  for (const row of completeSheet) {
    const storeName = String(row['STORE NAME'] || '').trim();
    if (!storeName || storeName.length < 3) continue;
    if (storeName.toLowerCase().includes('total') || storeName.toLowerCase().includes('summary')) continue;

    const city = String(row['CITY'] || row['AREA'] || '').trim();
    const key = storeKey(storeName, city);

    if (!storeMap.has(key)) {
      const province = normalizeProvince(row['PROVINCE']);
      storeMap.set(key, {
        storeCode: `HM${String(storeCounter++).padStart(5, '0')}`,
        storeName,
        area: String(row['AREA'] || '').trim(),
        city: city || 'Unknown',
        province,
        streetAddress: String(row['STREET ADDRESS'] || '').trim(),
        group: String(row['GROUP'] || '').trim(),
        isWholesaler: String(row['WHOLESALER'] || '').toUpperCase() === 'YES',
        isActive: String(row['ACTIVE/INACTIVE'] || 'ACTIVE').toUpperCase() !== 'INACTIVE',
        product: String(row['PRODUCT'] || '').trim(),
        clientType: String(row['TYPE OF CLIENT'] || 'COD').trim(),
        customerName: String(row['CUSTOMER NAME'] || '').trim(),
        customerNumber: String(row['CUSTOMER NUMBER'] || '').trim(),
        email: String(row['EMAIL'] || '').trim(),
        repName: String(row['REP NAME'] || '').trim(),
        lastVisitDate: excelDateToISO(row['DATE VISITED']),
        daysSinceVisit: row['Days since last visited'] || null,
        nextVisitDate: excelDateToISO(row['NEXT VISIT DATE']),
        lastInvoiceDate: excelDateToISO(row['Last invoice sent date']),
        daysFromLastOrder: row['Days from last order'] || null,
        creditApp: String(row['CREDIT APP'] || '').trim(),
        customerComments: String(row['CUSTOMER COMMENTS'] || '').trim(),
        happyAngry: String(row['HAPPY/ANGRY'] || '').trim(),
        storeType: 'independent',
        storeSize: 'medium',
        source: 'complete_sheet'
      });
    }
  }

  console.log(`After Complete sheet: ${storeMap.size} unique stores`);

  // Enrich with route plans data
  let enriched = 0;
  for (const row of routePlans) {
    const storeName = String(row['STORE NAME'] || '').trim();
    if (!storeName || storeName.length < 3) continue;

    const city = String(row['CITY'] || row['AREA'] || '').trim();
    const key = storeKey(storeName, city);

    if (storeMap.has(key)) {
      const existing = storeMap.get(key);
      // Enrich with any missing data from route plans
      if (!existing.repName && row['REP NAME']) existing.repName = String(row['REP NAME']).trim();
      if (!existing.lastVisitDate && row['DATE VISITED']) existing.lastVisitDate = excelDateToISO(row['DATE VISITED']);
      if (!existing.group && row['GROUP']) existing.group = String(row['GROUP']).trim();
      enriched++;
    } else {
      const province = normalizeProvince(row['PROVINCE']);
      storeMap.set(key, {
        storeCode: `HM${String(storeCounter++).padStart(5, '0')}`,
        storeName,
        area: String(row['AREA'] || '').trim(),
        city: city || 'Unknown',
        province,
        streetAddress: String(row['STREET ADDRESS'] || '').trim(),
        group: String(row['GROUP'] || '').trim(),
        isWholesaler: String(row['WHOLESALER'] || '').toUpperCase() === 'YES',
        isActive: String(row['ACTIVE/INACTIVE'] || 'ACTIVE').toUpperCase() !== 'INACTIVE',
        product: String(row['PRODUCT'] || '').trim(),
        clientType: String(row['TYPE OF CLIENT'] || 'COD').trim(),
        customerName: String(row['CUSTOMER NAME'] || '').trim(),
        customerNumber: String(row['CUSTOMER NUMBER'] || '').trim(),
        email: String(row['EMAIL'] || '').trim(),
        repName: String(row['REP NAME'] || '').trim(),
        lastVisitDate: excelDateToISO(row['DATE VISITED']),
        daysSinceVisit: row['Days since last visited'] || null,
        nextVisitDate: excelDateToISO(row['NEXT VISIT DATE']),
        lastInvoiceDate: excelDateToISO(row['Last invoice sent date']),
        daysFromLastOrder: row['Days from last order'] || null,
        creditApp: String(row['CREDIT APP'] || '').trim(),
        customerComments: String(row['CUSTOMER COMMENTS'] || '').trim(),
        happyAngry: String(row['HAPPY/ANGRY'] || '').trim(),
        storeType: 'independent',
        storeSize: 'medium',
        source: 'route_plans'
      });
    }
  }
  console.log(`After route plans: ${storeMap.size} unique stores (${enriched} enriched)`);

  // Add from MERGED SHEET (catch any missing)
  let mergedAdded = 0;
  for (const row of mergedData) {
    const storeName = String(row['STORE NAME'] || '').trim();
    if (!storeName || storeName.length < 3) continue;
    if (storeName.toLowerCase().includes('total') || storeName.toLowerCase().includes('summary')) continue;

    const city = String(row['CITY'] || row['AREA'] || '').trim();
    const key = storeKey(storeName, city);

    if (!storeMap.has(key)) {
      const province = normalizeProvince(row['PROVINCE']);
      storeMap.set(key, {
        storeCode: `HM${String(storeCounter++).padStart(5, '0')}`,
        storeName,
        area: String(row['AREA'] || '').trim(),
        city: city || 'Unknown',
        province,
        streetAddress: String(row['STREET ADDRESS'] || '').trim(),
        group: String(row['GROUP'] || '').trim(),
        isWholesaler: false,
        isActive: true,
        product: '',
        clientType: 'COD',
        customerName: String(row['CUSTOMER NAME'] || '').trim(),
        customerNumber: String(row['CUSTOMER NUMBER'] || '').trim(),
        email: '',
        repName: '',
        lastVisitDate: null,
        daysSinceVisit: null,
        nextVisitDate: null,
        lastInvoiceDate: null,
        daysFromLastOrder: null,
        creditApp: '',
        customerComments: '',
        happyAngry: '',
        storeType: 'independent',
        storeSize: 'medium',
        source: 'merged_sheet'
      });
      mergedAdded++;
    }
  }
  console.log(`After MERGED SHEET: ${storeMap.size} unique stores (+${mergedAdded} new)`);

  // Add INDEPENDANT NW AND MP
  let indAdded = 0;
  for (const row of [...mpSheet, ...nwSheet]) {
    const storeName = String(row['STORE NAME'] || '').trim();
    if (!storeName || storeName.length < 3) continue;

    const city = String(row['CITY'] || row['AREA'] || '').trim();
    const key = storeKey(storeName, city);

    if (!storeMap.has(key)) {
      const province = normalizeProvince(row['PROVINCE']);
      storeMap.set(key, {
        storeCode: `HM${String(storeCounter++).padStart(5, '0')}`,
        storeName,
        area: String(row['AREA'] || '').trim(),
        city: city || 'Unknown',
        province,
        streetAddress: String(row['STREET ADDRESS'] || '').trim(),
        group: String(row['GROUP'] || '').trim(),
        isWholesaler: false,
        isActive: true,
        product: '',
        clientType: 'COD',
        customerName: String(row['CUSTOMER NAME'] || '').trim(),
        customerNumber: String(row['CUSTOMER NUMBER'] || '').trim(),
        email: '',
        repName: '',
        lastVisitDate: null,
        daysSinceVisit: null,
        nextVisitDate: null,
        lastInvoiceDate: null,
        daysFromLastOrder: null,
        creditApp: '',
        customerComments: '',
        happyAngry: '',
        storeType: 'independent',
        storeSize: 'medium',
        source: 'independant_nw_mp'
      });
      indAdded++;
    }
  }
  console.log(`After INDEPENDANT NW/MP: ${storeMap.size} unique stores (+${indAdded} new)`);

  // Add Hardware list
  let hwAdded = 0;
  for (const row of hwData) {
    const storeName = String(row['STORE NAME'] || '').trim();
    if (!storeName || storeName.length < 3) continue;

    const city = String(row['CITY'] || row['AREA'] || '').trim();
    const key = storeKey(storeName, city);

    if (!storeMap.has(key)) {
      const province = normalizeProvince(row['PROVINCE']);
      storeMap.set(key, {
        storeCode: `HM${String(storeCounter++).padStart(5, '0')}`,
        storeName,
        area: String(row['AREA'] || '').trim(),
        city: city || 'Unknown',
        province,
        streetAddress: String(row['STREET ADDRESS'] || '').trim(),
        group: '',
        isWholesaler: false,
        isActive: true,
        product: 'Cornice',
        clientType: String(row['TYPE OF CLIENT'] || 'COD').trim(),
        customerName: String(row['CUSTOMER NAME'] || '').trim(),
        customerNumber: String(row['CUSTOMER NUMBER'] || '').trim(),
        email: String(row['EMAIL'] || '').trim(),
        repName: '',
        lastVisitDate: null,
        daysSinceVisit: null,
        nextVisitDate: null,
        lastInvoiceDate: null,
        daysFromLastOrder: null,
        creditApp: '',
        customerComments: '',
        happyAngry: '',
        storeType: 'independent',
        storeSize: 'medium',
        source: 'hardware_list'
      });
      hwAdded++;
    }
  }
  console.log(`After Hardware list: ${storeMap.size} unique stores (+${hwAdded} new)`);

  // ============================================================
  // Determine store size and type from name/group
  // ============================================================
  for (const [, store] of storeMap) {
    const name = store.storeName.toLowerCase();
    const group = store.group.toLowerCase();

    // Store type
    if (group.includes('power build') || group.includes('makro') || group.includes('builders') ||
        group.includes('cashbuild') || group.includes('buco') || group.includes('build it')) {
      store.storeType = 'chain';
    } else if (group.includes('est') || group.includes('essential') || group.includes('elite') ||
               group.includes('best build') || group.includes('dreiers')) {
      store.storeType = 'franchise';
    }

    // Store size
    if (name.includes('mega') || name.includes('warehouse') || name.includes('depot') ||
        group.includes('makro') || group.includes('builders warehouse')) {
      store.storeSize = 'large';
    } else if (name.includes('mini') || name.includes('spaza') || store.clientType === 'COD') {
      store.storeSize = 'small';
    }
  }

  // Convert to array
  const allStores = Array.from(storeMap.values());

  // ============================================================
  // EXTRACT SALES REP DATA
  // ============================================================
  const repMap = new Map();
  for (const store of allStores) {
    if (store.repName && store.repName.length > 1) {
      const repKey = store.repName.toLowerCase();
      if (!repMap.has(repKey)) {
        repMap.set(repKey, {
          name: store.repName,
          storeCount: 0,
          provinces: new Set(),
          areas: new Set(),
          cities: new Set()
        });
      }
      const rep = repMap.get(repKey);
      rep.storeCount++;
      rep.provinces.add(store.province);
      rep.areas.add(store.area);
      rep.cities.add(store.city);
    }
  }

  const salesReps = Array.from(repMap.entries()).map(([key, rep], index) => ({
    empId: `REP${String(index + 1).padStart(3, '0')}`,
    name: rep.name,
    storeCount: rep.storeCount,
    provinces: Array.from(rep.provinces).filter(Boolean),
    territories: Array.from(rep.areas).filter(Boolean).slice(0, 20),
    cities: Array.from(rep.cities).filter(Boolean)
  }));

  console.log(`\nSales Reps found: ${salesReps.length}`);
  salesReps.forEach(r => console.log(`  ${r.name}: ${r.storeCount} stores, ${r.provinces.join(', ')}`));

  // ============================================================
  // EXTRACT GROUP/RETAIL CHAIN DATA
  // ============================================================
  const groupMap = new Map();
  for (const store of allStores) {
    if (store.group && store.group.length > 1) {
      const gKey = store.group.toLowerCase();
      if (!groupMap.has(gKey)) {
        groupMap.set(gKey, { name: store.group, storeCount: 0, provinces: new Set() });
      }
      groupMap.get(gKey).storeCount++;
      groupMap.get(gKey).provinces.add(store.province);
    }
  }

  const retailGroups = Array.from(groupMap.entries())
    .map(([, g]) => ({ name: g.name, storeCount: g.storeCount, provinces: Array.from(g.provinces) }))
    .sort((a, b) => b.storeCount - a.storeCount);

  console.log(`\nRetail Groups found: ${retailGroups.length}`);
  retailGroups.slice(0, 15).forEach(g => console.log(`  ${g.name}: ${g.storeCount} stores`));

  // ============================================================
  // PROVINCE BREAKDOWN
  // ============================================================
  const provinceMap = new Map();
  for (const store of allStores) {
    if (!provinceMap.has(store.province)) {
      provinceMap.set(store.province, { name: store.province, storeCount: 0, cities: new Set(), activeCount: 0 });
    }
    provinceMap.get(store.province).storeCount++;
    provinceMap.get(store.province).cities.add(store.city);
    if (store.isActive) provinceMap.get(store.province).activeCount++;
  }

  const provinces = Array.from(provinceMap.entries())
    .map(([, p]) => ({ name: p.name, storeCount: p.storeCount, activeCount: p.activeCount, cityCount: p.cities.size, cities: Array.from(p.cities).filter(Boolean) }))
    .sort((a, b) => b.storeCount - a.storeCount);

  console.log(`\nProvince Breakdown:`);
  provinces.forEach(p => console.log(`  ${p.name}: ${p.storeCount} stores (${p.activeCount} active) in ${p.cityCount} cities`));

  // ============================================================
  // TERRITORY/AREA BREAKDOWN (for Zollie mapping)
  // ============================================================
  const areaMap = new Map();
  for (const store of allStores) {
    const area = store.area || store.city;
    if (area && area.length > 1) {
      const aKey = area.toLowerCase();
      if (!areaMap.has(aKey)) {
        areaMap.set(aKey, { name: area, province: store.province, storeCount: 0, reps: new Set() });
      }
      areaMap.get(aKey).storeCount++;
      if (store.repName) areaMap.get(aKey).reps.add(store.repName);
    }
  }

  const territories = Array.from(areaMap.entries())
    .map(([, a]) => ({ name: a.name, province: a.province, storeCount: a.storeCount, reps: Array.from(a.reps) }))
    .sort((a, b) => b.storeCount - a.storeCount);

  console.log(`\nTerritories (Areas): ${territories.length}`);
  territories.slice(0, 20).forEach(t => console.log(`  ${t.name} (${t.province}): ${t.storeCount} stores, Reps: ${t.reps.join(', ') || 'unassigned'}`));

  // ============================================================
  // TOP 40 PRIORITY CUSTOMERS
  // ============================================================
  const top40Customers = top40.filter(r => r['Company Name']).map((r, i) => ({
    rank: i + 1,
    companyName: String(r['Company Name'] || '').trim(),
    province: normalizeProvince(r['PROVINCE']),
    lastInvoiceDate: excelDateToISO(r['Date of last inv']),
    corniceManufacturer: String(r['CM'] || '').trim()
  }));

  console.log(`\nTop 40 customers: ${top40Customers.length}`);

  // ============================================================
  // CLIENTS VISITED DATA
  // ============================================================
  const visitLog = cvData.filter(r => r['Name']).map(r => ({
    storeName: String(r['Name'] || '').trim(),
    contactName: String(r['Contact Name'] || '').trim(),
    telephone: String(r['Telephone'] || '').trim(),
    lastVisitDate: excelDateToISO(r['LAST DATE VISITED']),
    repVisited: String(r['REP VISITED'] || '').trim(),
    lastInvoicedDate: excelDateToISO(r['LAST INVOICED DATE'])
  }));

  console.log(`Visit log entries: ${visitLog.length}`);

  // ============================================================
  // PRICING DATA
  // ============================================================
  const pricing = bpData.map(r => {
    const entry = {};
    for (const [key, val] of Object.entries(r)) {
      entry[key] = val;
    }
    return entry;
  });

  console.log(`Pricing entries: ${pricing.length}`);

  // ============================================================
  // SUMMARY STATS
  // ============================================================
  const stats = {
    totalStores: allStores.length,
    activeStores: allStores.filter(s => s.isActive).length,
    inactiveStores: allStores.filter(s => !s.isActive).length,
    totalProvinces: provinces.length,
    totalCities: new Set(allStores.map(s => s.city)).size,
    totalTerritories: territories.length,
    totalSalesReps: salesReps.length,
    totalRetailGroups: retailGroups.length,
    wholesalers: allStores.filter(s => s.isWholesaler).length,
    chainStores: allStores.filter(s => s.storeType === 'chain').length,
    franchiseStores: allStores.filter(s => s.storeType === 'franchise').length,
    independentStores: allStores.filter(s => s.storeType === 'independent').length,
    storesWithEmail: allStores.filter(s => s.email).length,
    storesWithRep: allStores.filter(s => s.repName).length,
    top40Count: top40Customers.length,
    visitLogCount: visitLog.length
  };

  console.log('\n=== FINAL STATS ===');
  console.log(JSON.stringify(stats, null, 2));

  // ============================================================
  // WRITE OUTPUT
  // ============================================================
  const output = {
    extractedAt: new Date().toISOString(),
    stats,
    stores: allStores,
    salesReps,
    retailGroups,
    provinces,
    territories,
    top40Customers,
    visitLog,
    pricing
  };

  const outputPath = path.join(__dirname, '..', 'client', 'src', 'data', 'realClientData.json');
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote seed data to: ${outputPath}`);
  console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

  return output;
}

extractAllData();
