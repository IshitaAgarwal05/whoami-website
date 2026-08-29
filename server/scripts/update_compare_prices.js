const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

async function doUpdates() {
    console.log('🚀 Starting requested original_price updates...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized.');
        process.exit(1);
    }

    // 1. Update Toothless Keychain (id: 36) original_price to 199
    console.log('Updating Toothless Keychain original_price...');
    const { error: err1 } = await supabase
        .from('products')
        .update({ original_price: 199 })
        .eq('internal_id', '36');
    if (err1) console.error('Error updating Toothless Keychain:', err1);
    else console.log('✅ Toothless Keychain original_price updated to 199.');

    // 2. Update Duck Charm (id: 37) original_price to 89
    console.log('Updating Duck Charm original_price...');
    const { error: err2 } = await supabase
        .from('products')
        .update({ original_price: 89 })
        .eq('internal_id', '37');
    if (err2) console.error('Error updating Duck Charm:', err2);
    else console.log('✅ Duck Charm original_price updated to 89.');

    console.log('🎉 Updates completed successfully.');
    process.exit(0);
}

doUpdates();
