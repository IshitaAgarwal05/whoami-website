const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

async function updateDbImagePaths() {
    console.log('🚀 Updating image paths in DB...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized.');
        process.exit(1);
    }

    const { data: products, error } = await supabase.from('products').select('internal_id, image_url');

    for (let product of products) {
        if (product.image_url && product.image_url.includes(' ')) {
            const newUrl = product.image_url.replace(/ /g, '_');
            await supabase.from('products').update({ image_url: newUrl }).eq('internal_id', product.internal_id);
            console.log(`✅ Updated ${product.internal_id} to ${newUrl}`);
        }
    }

    console.log('Done!');
    process.exit(0);
}

updateDbImagePaths();
