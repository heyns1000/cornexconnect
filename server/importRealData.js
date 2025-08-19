const { processAllExcelFiles } = require('./processRealExcelData');
const { Pool } = require('@neondatabase/serverless');

async function importAllRealData() {
    try {
        console.log('🔄 Starting import of ALL real Excel data...');
        
        // Process all Excel files to extract real store data
        const stores = await processAllExcelFiles();
        
        if (stores.length === 0) {
            console.log('❌ No stores found in Excel files');
            return false;
        }

        console.log(`📊 Found ${stores.length} real stores from Excel files`);

        // Connect to database
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        
        // Clear existing fake data
        await pool.query('DELETE FROM hardware_stores');
        console.log('✅ Cleared existing fake store data');

        // Insert real stores in batches
        const batchSize = 50;
        let imported = 0;

        for (let i = 0; i < stores.length; i += batchSize) {
            const batch = stores.slice(i, i + batchSize);
            
            for (const store of batch) {
                try {
                    await pool.query(`
                        INSERT INTO hardware_stores (
                            store_code, store_name, owner_name, contact_person, 
                            phone, email, address, city, province, store_type, 
                            store_size, credit_rating, monthly_potential, is_active
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    `, [
                        store.storeCode, store.storeName, store.ownerName, store.contactPerson,
                        store.phone, store.email, store.address, store.city, store.province, store.storeType,
                        store.store_size, store.creditRating, store.monthlyPotential, store.isActive
                    ]);
                    imported++;
                } catch (error) {
                    console.error(`Failed to import store ${store.storeName}:`, error.message);
                }
            }
            
            console.log(`📈 Imported batch ${Math.floor(i/batchSize) + 1}: ${imported} stores total`);
        }

        await pool.end();
        
        console.log(`🎉 Successfully imported ${imported} real stores from Excel files!`);
        console.log('✅ All authentic business data is now in the database');
        
        return true;
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        return false;
    }
}

// Run the import
importAllRealData().then(success => {
    if (success) {
        console.log('🚀 Real data import completed successfully!');
    } else {
        console.log('💥 Import failed - check logs above');
    }
    process.exit(success ? 0 : 1);
});