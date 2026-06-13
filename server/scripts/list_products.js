const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: products, error: pError } = await supabase.from('products').select('*');
  const { data: combos, error: cError } = await supabase.from('combos').select('*');

  if (pError) console.error("Error products:", pError);
  if (cError) console.error("Error combos:", cError);

  const result = {
    products: products || [],
    combos: combos || []
  };

  fs.writeFileSync(path.join(__dirname, '../data/products_dump.json'), JSON.stringify(result, null, 2));
  console.log(`Fetched ${result.products.length} products and ${result.combos.length} combos.`);
}

run();
