require('dotenv').config();
const supabase = require('../db/supabaseClient');
const excelService = require('../services/excelService');

async function checkAndCreateTables() {
    // Note: In Supabase, it is much easier to create tables using the SQL editor in the dashboard.
    // I will output the SQL required to create the tables so the user can easily copy and paste it into the Supabase SQL editor.
    console.log(`
====================================================================
PLEASE RUN THIS SQL IN YOUR SUPABASE DASHBOARD -> SQL EDITOR FIRST
====================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  internal_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category VARCHAR(100),
  material VARCHAR(100),
  image_url VARCHAR(255),
  stock INTEGER DEFAULT 10,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS combos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  internal_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER,
  items JSONB,
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
====================================================================
`);
}

async function runMigration() {
    if (!supabase) {
        console.error('❌ Supabase client is not initialized. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
        process.exit(1);
    }

    await checkAndCreateTables();

    // 1. Fetch data from Excel files using the existing Excel service
    console.log('Reading data from local Excel/txt files...');
    const products = await excelService.getAllProducts();
    const combos = await excelService.getAllCombos();

    // 2. Transform the local data into Supabase schema format
    console.log(`Found ${products.length} products and ${combos.length} combos. Transforming data...`);

    const supabaseProducts = products.map(p => ({
        internal_id: String(p.ID),
        name: p.Name,
        description: p.Description,
        price: p.Price,
        original_price: p.OriginalPrice || null, // Added
        category: p.Category,
        material: p.Material,
        image_url: p.ImageURL,
        stock: 10,
        tags: [],
        use_case: p.UseCase || null, // Added
        dimensions: p.Dimensions || null, // Added
        weight: p.Weight || null // Added
    }));

    const supabaseCombos = combos.map(c => ({
        internal_id: String(c.ID),
        name: c.Name,
        description: c.Description,
        price: c.Price,
        original_price: c.OriginalPrice || null,
        items: c.Items || [],
        image_url: c.ImageURL,
        is_active: true
    }));

    // 3. Upsert data into Supabase to prevent duplicates if script runs twice
    console.log('Inserting products into Supabase...');
    const { data: pData, error: pError } = await supabase
        .from('products')
        .upsert(supabaseProducts, { onConflict: 'internal_id' });

    if (pError) {
        console.error('❌ Error inserting products:', pError);
    } else {
        console.log('✅ Products successfully migrated.');
    }

    console.log('Inserting combos into Supabase...');
    const { data: cData, error: cError } = await supabase
        .from('combos')
        .upsert(supabaseCombos, { onConflict: 'internal_id' });

    if (cError) {
        console.error('❌ Error inserting combos:', cError);
    } else {
        console.log('✅ Combos successfully migrated.');
    }

    console.log('\nMigration complete! Verify your tables in the Supabase Dashboard.');
    process.exit(0);
}

runMigration();
