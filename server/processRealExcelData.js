const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Function to process all real Excel files and extract hardware store data
async function processAllExcelFiles() {
    const excelFiles = [
        'attached_assets/MERGED SHEET_1754172955402.xlsx',
        'attached_assets/Hardware list_1754172955406.xlsx',
        'attached_assets/Homemart Customer List_1755025417066.xlsx',
        'attached_assets/Homemart Customer List_1755025671557.xlsx',
        'attached_assets/Homemart Customer List_1755026806007.xlsx',
        'attached_assets/Homemart Customer List (1)_1755027266574.xlsx',
        'attached_assets/Homemart Customer List_1755027738205.xlsx',
        'attached_assets/INDEPENDANT NW AND MP_1755016203148.xlsx',
        'attached_assets/INDEPENDANT NW AND MP_1755027266575.xlsx',
        'attached_assets/INDEPENDANT NW AND MP_1755027738205.xlsx'
    ];

    const allStores = [];
    let storeCode = 1000;

    for (const filePath of excelFiles) {
        try {
            if (fs.existsSync(filePath)) {
                console.log(`Processing: ${filePath}`);
                const workbook = XLSX.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                console.log(`Found ${jsonData.length} rows in ${path.basename(filePath)}`);

                for (const row of jsonData) {
                    // Extract store data from various column formats
                    const storeName = row['STORE NAME'] || row['Store Name'] || row['CUSTOMER NAME'] || row['Customer Name'] || row['Company'] || row['Business Name'] || '';
                    const province = row['PROVINCE'] || row['Province'] || row['REGION'] || row['Region'] || 'GAUTENG';
                    const city = row['CITY'] || row['City'] || row['TOWN'] || row['Town'] || row['Location'] || 'Johannesburg';
                    const customerName = row['CUSTOMER NAME'] || row['Customer Name'] || row['Contact Person'] || row['Owner'] || '';
                    const address = row['ADDRESS'] || row['Address'] || row['Physical Address'] || `${city} Business District`;
                    const phone = row['PHONE'] || row['Phone'] || row['Tel'] || row['Telephone'] || '';
                    const email = row['EMAIL'] || row['Email'] || row['E-mail'] || '';

                    if (storeName && storeName.length > 2 && !storeName.toLowerCase().includes('total') && !storeName.toLowerCase().includes('summary')) {
                        storeCode++;
                        
                        const storeSize = determineStoreSize(storeName);
                        const storeType = determineStoreType(storeName);
                        const creditRating = determineCreditRating(storeName);
                        const monthlyPotential = determineMonthlyPotential(storeSize, province);

                        allStores.push({
                            storeCode: `ST${storeCode.toString().padStart(4, '0')}`,
                            storeName: storeName.trim(),
                            ownerName: customerName || 'Store Owner',
                            contactPerson: customerName || 'Manager',
                            phone: phone || '',
                            email: email || '',
                            address: address,
                            city: city.trim(),
                            province: province.trim().toUpperCase(),
                            storeType: storeType,
                            storeSize: storeSize,
                            creditRating: creditRating,
                            monthlyPotential: monthlyPotential,
                            isActive: true
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error.message);
        }
    }

    console.log(`Total stores extracted: ${allStores.length}`);
    return allStores;
}

function determineStoreSize(storeName) {
    const name = storeName.toLowerCase();
    if (name.includes('mega') || name.includes('warehouse') || name.includes('depot') || name.includes('build it')) {
        return 'large';
    } else if (name.includes('center') || name.includes('builders') || name.includes('hardware')) {
        return 'medium';
    }
    return 'small';
}

function determineStoreType(storeName) {
    const name = storeName.toLowerCase();
    if (name.includes('build it') || name.includes('builders warehouse') || name.includes('home depot') || name.includes('cashbuild')) {
        return 'chain';
    }
    return 'independent';
}

function determineCreditRating(storeName) {
    const name = storeName.toLowerCase();
    if (name.includes('mega') || name.includes('build it') || name.includes('warehouse')) {
        return 'excellent';
    } else if (name.includes('builders') || name.includes('hardware')) {
        return 'good';
    }
    return 'fair';
}

function determineMonthlyPotential(storeSize, province) {
    const baseAmount = {
        'large': 60000,
        'medium': 35000,
        'small': 18000
    }[storeSize] || 20000;

    const provinceMultiplier = {
        'GAUTENG': 1.3,
        'WESTERN CAPE': 1.2,
        'KWAZULU-NATAL': 1.1,
        'EASTERN CAPE': 0.9,
        'LIMPOPO': 0.8,
        'NORTH WEST': 0.85,
        'MPUMALANGA': 0.9,
        'FREE STATE': 0.85,
        'NORTHERN CAPE': 0.7
    }[province] || 1.0;

    return Math.round(baseAmount * provinceMultiplier);
}

module.exports = { processAllExcelFiles };