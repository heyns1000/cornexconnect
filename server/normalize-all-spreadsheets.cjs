/**
 * Universal Spreadsheet Normalizer for CornexConnect
 *
 * Handles ALL different column layouts from staff spreadsheets and normalizes
 * them into a single consistent format for the app and CSV export.
 *
 * Supported formats:
 * - Homemart Customer List (route plans, complete sheet, TOP 40, Sheet3)
 * - CLIENTS VISITED (January sheet)
 * - Hardware list
 * - INDEPENDANT NW AND MP
 * - MERGED SHEET
 * - ZOLLIE area files
 * - Buildmart costing/pricing (product data, not store data)
 *
 * Output: normalized JSON + CSV with consistent columns
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Standard output columns - this is what every record will look like
const STANDARD_COLUMNS = [
  'store_code',
  'store_name',
  'owner_name',
  'contact_person',
  'phone',
  'email',
  'address',
  'area',
  'city',
  'province',
  'store_type',
  'store_size',
  'credit_rating',
  'monthly_potential',
  'group_name',
  'wholesaler',
  'rep_name',
  'customer_number',
  'product',
  'active_status',
  'last_visit_date',
  'last_invoice_date',
  'last_phone_date',
  'notes',
  'source_file'
];

// Column name mappings - maps all variations to standard names
const COLUMN_MAP = {
  // Store name variations
  'store name': 'store_name',
  'storename': 'store_name',
  'name': 'store_name',
  'company name': 'store_name',
  'trading name': 'store_name',
  'legal entity': 'store_name',
  'shop name': 'store_name',
  'business name': 'store_name',
  'client name': 'store_name',
  'client': 'store_name',

  // Contact/owner
  'contact name': 'contact_person',
  'contact person': 'contact_person',
  'contact': 'contact_person',
  'customer name': 'owner_name',
  'owner': 'owner_name',
  'owner name': 'owner_name',

  // Phone
  'telephone': 'phone',
  'phone': 'phone',
  'phone number': 'phone',
  'tel': 'phone',
  'cell': 'phone',
  'mobile': 'phone',
  'contact number': 'phone',

  // Email
  'email': 'email',
  'e-mail': 'email',
  'email address': 'email',

  // Address
  'street address': 'address',
  'address': 'address',
  'physical address': 'address',

  // Location
  'area': 'area',
  'territory': 'area',
  'suburb': 'area',
  'city': 'city',
  'town': 'city',
  'province': 'province',
  'region': 'province',
  'state': 'province',

  // Store classification
  'type of client': 'store_type',
  'store type': 'store_type',
  'type': 'store_type',
  'group': 'group_name',
  'group name': 'group_name',
  'wholesaler': 'wholesaler',
  'chain': 'group_name',

  // Customer details
  'customer number': 'customer_number',
  'account number': 'customer_number',
  'account no': 'customer_number',
  'cust no': 'customer_number',
  'customer code': 'customer_number',

  // Rep
  'rep name': 'rep_name',
  'rep visited': 'rep_name',
  'sales rep': 'rep_name',
  'rep': 'rep_name',
  'phoned by': 'rep_name',
  'cm': 'rep_name',

  // Product
  'product': 'product',
  'products': 'product',
  'cornice maker': 'product',
  'current supplier': 'notes',

  // Status
  'active/inactive': 'active_status',
  'status': 'active_status',
  'active': 'active_status',
  'happy/angry': 'notes',
  'client feedback': 'notes',
  'customer comments': 'notes',

  // Dates
  'date visited': 'last_visit_date',
  'last date visited': 'last_visit_date',
  'last visit': 'last_visit_date',
  'next visit date': 'last_visit_date',
  'last invoiced date': 'last_invoice_date',
  'last invoice sent date': 'last_invoice_date',
  'date of last inv': 'last_invoice_date',
  'last phoned date': 'last_phone_date',

  // Credit
  'credit app': 'credit_rating',
  'credit rating': 'credit_rating',
  'credit': 'credit_rating',

  // Potential
  'monthly potential': 'monthly_potential',
  'potential': 'monthly_potential',
};

// Province name normalization - staff typed these differently everywhere
const PROVINCE_MAP = {
  'gauteng': 'GAUTENG',
  'limpopo': 'LIMPOPO',
  'kwazulu-natal': 'KWAZULU-NATAL',
  'kwazulu natal': 'KWAZULU-NATAL',
  'kwa zulu natal': 'KWAZULU-NATAL',
  'kwa-zulu natal': 'KWAZULU-NATAL',
  'ekwa-zulu natal': 'KWAZULU-NATAL',
  'kzn': 'KWAZULU-NATAL',
  'durban': 'KWAZULU-NATAL',
  'mpumalanga': 'MPUMALANGA',
  'mpumulanga': 'MPUMALANGA',
  'pmumalanga': 'MPUMALANGA',
  'western cape': 'WESTERN CAPE',
  'western cap': 'WESTERN CAPE',
  'westen cape': 'WESTERN CAPE',
  'wester cape': 'WESTERN CAPE',
  'cape town': 'WESTERN CAPE',
  'eastern cape': 'EASTERN CAPE',
  'easterb cape': 'EASTERN CAPE',
  'east london': 'EASTERN CAPE',
  'port elizabeth': 'EASTERN CAPE',
  'mthatha': 'EASTERN CAPE',
  'queenstown': 'EASTERN CAPE',
  'north west': 'NORTH WEST',
  'north west province': 'NORTH WEST',
  'free state': 'FREE STATE',
  'free-state': 'FREE STATE',
  'freestate': 'FREE STATE',
  'northern cape': 'NORTHERN CAPE',
  'nothern cape': 'NORTHERN CAPE',
  'polokwane': 'LIMPOPO',
  'johannesburg': 'GAUTENG',
  'botswana': 'BOTSWANA',
  'namibia': 'NAMIBIA',
  'lesotho': 'LESOTHO',
  'swaziland': 'ESWATINI',
  'eswatini': 'ESWATINI',
  'zimbabwe': 'ZIMBABWE',
  'malawi': 'MALAWI',
  'zambia': 'ZAMBIA',
  'mozambique': 'MOZAMBIQUE',
};

// Rep name normalization
const REP_MAP = {
  'heyns': 'Heyns',
  'gerhard': 'Gerhard',
  'gerhar': 'Gerhard',
  'gerhard/ash': 'Gerhard',
  'gerhard/ ash': 'Gerhard',
  'tyrone': 'Tyrone',
  'tyrone/reinhardt': 'Tyrone',
  'reinhardt': 'Reinhardt',
  'reinhard': 'Reinhardt',
  'g&t': 'G&T',
  'elsa': 'Elsa',
  'theuns': 'Theuns',
  'ash': 'Ash',
  'yolandi': 'Yolandi',
  'marese': 'Marese',
  'sifiso': 'Sifiso',
  'wesley': 'Wesley',
  'shaldien': 'Shaldien',
  'san3': 'San3',
};

function normalizeProvince(val) {
  if (!val) return '';
  const key = val.trim().toLowerCase();
  return PROVINCE_MAP[key] || val.trim().toUpperCase();
}

function normalizeRep(val) {
  if (!val) return '';
  const key = val.trim().toLowerCase();
  return REP_MAP[key] || val.trim();
}

function normalizeColumnName(raw) {
  if (!raw) return null;
  const clean = String(raw).trim().toLowerCase().replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ');
  return COLUMN_MAP[clean] || null;
}

function cleanValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object' && val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return String(val).trim();
}

function generateStoreCode(index, sourceFile) {
  const prefix = sourceFile.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  return `${prefix}${String(index).padStart(4, '0')}`;
}

function normalizeSheet(sheetData, headers, sourceFile, sheetName) {
  const results = [];

  // Map headers to standard columns
  const headerMap = {};
  headers.forEach((h, i) => {
    const mapped = normalizeColumnName(h);
    if (mapped) {
      headerMap[i] = mapped;
    }
  });

  // Skip sheets with no recognizable columns
  if (Object.keys(headerMap).length < 2) {
    console.log(`  Skipping sheet "${sheetName}" - no recognizable columns`);
    return results;
  }

  for (let r = 0; r < sheetData.length; r++) {
    const row = sheetData[r];
    const record = {};

    // Initialize all standard columns
    STANDARD_COLUMNS.forEach(col => record[col] = '');

    // Map values
    for (const [colIdx, stdCol] of Object.entries(headerMap)) {
      const val = cleanValue(row[parseInt(colIdx)]);
      if (val) {
        // If we already have a value for this field, append (don't overwrite)
        if (record[stdCol] && stdCol === 'notes') {
          record[stdCol] += '; ' + val;
        } else if (!record[stdCol]) {
          record[stdCol] = val;
        }
      }
    }

    // Skip empty rows
    if (!record.store_name && !record.owner_name && !record.contact_person) {
      continue;
    }

    // Generate store code if missing
    if (!record.store_code) {
      record.store_code = generateStoreCode(results.length + 1, sourceFile);
    }

    // Normalize province and rep names
    record.province = normalizeProvince(record.province);
    record.rep_name = normalizeRep(record.rep_name);

    // Add source tracking
    record.source_file = `${sourceFile}:${sheetName}`;

    results.push(record);
  }

  return results;
}

function isProductData(headers) {
  const headerStr = headers.map(h => String(h || '').toLowerCase()).join(' ');
  return headerStr.includes('cost') && headerStr.includes('sell') && !headerStr.includes('store');
}

function processFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\nProcessing: ${fileName}`);

  try {
    const workbook = XLSX.readFile(filePath);
    const allRecords = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (rawData.length < 2) {
        console.log(`  Sheet "${sheetName}": empty, skipping`);
        continue;
      }

      const headers = rawData[0];
      const data = rawData.slice(1);

      // Skip product/pricing sheets (Buildmart costing)
      if (isProductData(headers)) {
        console.log(`  Sheet "${sheetName}": product pricing data (${data.length} rows) - keeping separate`);
        continue;
      }

      console.log(`  Sheet "${sheetName}": ${data.length} rows, ${headers.filter(Boolean).length} columns`);

      const normalized = normalizeSheet(data, headers, fileName, sheetName);
      console.log(`    -> Normalized: ${normalized.length} records`);
      allRecords.push(...normalized);
    }

    return allRecords;
  } catch (error) {
    console.error(`  ERROR processing ${fileName}: ${error.message}`);
    return [];
  }
}

function deduplicateRecords(records) {
  const seen = new Map();
  const deduped = [];

  for (const record of records) {
    // Create a dedup key from store name + city + province (normalized)
    const key = [
      record.store_name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      record.city.toLowerCase().replace(/[^a-z0-9]/g, ''),
      record.province.toLowerCase().replace(/[^a-z0-9]/g, '')
    ].join('|');

    if (key.length < 5) {
      // Too short to dedup reliably, keep it
      deduped.push(record);
      continue;
    }

    if (seen.has(key)) {
      // Merge: keep the record with more data
      const existing = seen.get(key);
      let existingFields = Object.values(existing).filter(v => v && v.length > 0).length;
      let newFields = Object.values(record).filter(v => v && v.length > 0).length;

      if (newFields > existingFields) {
        // Replace with richer record
        const idx = deduped.indexOf(existing);
        if (idx >= 0) deduped[idx] = record;
        seen.set(key, record);
      }
    } else {
      seen.set(key, record);
      deduped.push(record);
    }
  }

  return deduped;
}

function toCSV(records) {
  const lines = [STANDARD_COLUMNS.join(',')];

  for (const record of records) {
    const values = STANDARD_COLUMNS.map(col => {
      const val = record[col] || '';
      // Escape CSV values
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

// Main execution
const assetsDir = path.join(__dirname, '..', 'attached_assets');
if (!fs.existsSync(assetsDir)) {
  // Fallback
  const altDir = path.join(__dirname, 'attached_assets');
  if (!fs.existsSync(altDir)) {
    console.error('attached_assets directory not found');
    process.exit(1);
  }
}

const files = fs.readdirSync(path.join(__dirname, '..', 'attached_assets'))
  .filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'))
  .map(f => path.join(__dirname, '..', 'attached_assets', f));

console.log(`Found ${files.length} spreadsheet files`);
console.log('='.repeat(60));

let allRecords = [];
const productFiles = [];

for (const file of files) {
  const records = processFile(file);
  allRecords.push(...records);
}

console.log('\n' + '='.repeat(60));
console.log(`Total raw records: ${allRecords.length}`);

// Deduplicate
const deduped = deduplicateRecords(allRecords);
console.log(`After deduplication: ${deduped.length} unique records`);

// Assign clean sequential store codes
deduped.forEach((record, i) => {
  record.store_code = `CC${String(i + 1).padStart(5, '0')}`;
});

// Stats
const provinces = {};
const groups = {};
const reps = {};
deduped.forEach(r => {
  if (r.province) provinces[r.province] = (provinces[r.province] || 0) + 1;
  if (r.group_name) groups[r.group_name] = (groups[r.group_name] || 0) + 1;
  if (r.rep_name) reps[r.rep_name] = (reps[r.rep_name] || 0) + 1;
});

console.log(`\nBy Province:`);
Object.entries(provinces).sort((a, b) => b[1] - a[1]).forEach(([p, c]) => {
  console.log(`  ${p}: ${c}`);
});

console.log(`\nBy Group (top 20):`);
Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([g, c]) => {
  console.log(`  ${g}: ${c}`);
});

console.log(`\nBy Rep:`);
Object.entries(reps).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => {
  console.log(`  ${r}: ${c}`);
});

// Write outputs
const outputDir = path.join(__dirname);

// 1. Normalized JSON
const jsonPath = path.join(outputDir, 'normalized-clients.json');
fs.writeFileSync(jsonPath, JSON.stringify({
  metadata: {
    totalRecords: deduped.length,
    provinces: Object.keys(provinces).length,
    groups: Object.keys(groups).length,
    reps: Object.keys(reps).length,
    generatedAt: new Date().toISOString(),
    sourceFiles: files.map(f => path.basename(f))
  },
  byProvince: provinces,
  byGroup: groups,
  byRep: reps,
  records: deduped
}, null, 2));
console.log(`\nWritten: ${jsonPath} (${deduped.length} records)`);

// 2. CSV for download/import
const csvPath = path.join(outputDir, 'normalized-clients.csv');
fs.writeFileSync(csvPath, toCSV(deduped));
console.log(`Written: ${csvPath}`);

// 3. Summary
console.log(`\n${'='.repeat(60)}`);
console.log('NORMALIZATION COMPLETE');
console.log(`${'='.repeat(60)}`);
console.log(`Input: ${files.length} files`);
console.log(`Output: ${deduped.length} unique client records`);
console.log(`Columns: ${STANDARD_COLUMNS.length} standardized fields`);
console.log(`Files: normalized-clients.json + normalized-clients.csv`);
