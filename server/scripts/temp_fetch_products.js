const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

async function fetchProducts() {
    if (!supabase) {
        console.error('Supabase client not initialized.');
        process.exit(1);
    }

    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

fetchProducts();
