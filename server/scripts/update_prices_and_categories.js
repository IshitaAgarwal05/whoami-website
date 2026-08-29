const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

async function doUpdates() {
    console.log('🚀 Starting requested updates...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized.');
        process.exit(1);
    }

    // 1. Update Toothless Keychain (id: 36) price to 99
    console.log('Updating Toothless Keychain price...');
    const { error: err1 } = await supabase
        .from('products')
        .update({ price: 99 })
        .eq('internal_id', '36');
    if (err1) console.error('Error updating Toothless Keychain:', err1);
    else console.log('✅ Toothless Keychain price updated to 99.');

    // 2. Update Duck Charm (id: 37) price to 39
    console.log('Updating Duck Charm price...');
    const { error: err2 } = await supabase
        .from('products')
        .update({ price: 39 })
        .eq('internal_id', '37');
    if (err2) console.error('Error updating Duck Charm:', err2);
    else console.log('✅ Duck Charm price updated to 39.');

    // 3. Make all keychains appear in charms tab by standardizing category to "Keychains"
    // (The frontend filters charms tab by p.Category === 'Keychains' || p.Category === 'Charms')
    console.log('Standardizing "Keychain" to "Keychains"...');
    const { error: err3 } = await supabase
        .from('products')
        .update({ category: 'Keychains' })
        .eq('category', 'Keychain');
    if (err3) console.error('Error standardizing Keychains category:', err3);
    else console.log('✅ Standardized "Keychain" category to "Keychains".');

    console.log('🎉 Updates completed successfully.');
    process.exit(0);
}

doUpdates();
