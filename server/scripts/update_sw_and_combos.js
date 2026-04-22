const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

async function updateDatabase() {
    console.log('🚀 Updating Star Wars products and Combos...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized.');
        process.exit(1);
    }

    // 1. Update Star Wars Products
    const swUpdates = [
        { internal_id: '14', image_url: '/products/vader/vader-1.JPEG' },
        { internal_id: '16', image_url: '/products/taooine/tatooine-1.JPEG' }
    ];

    for (const update of swUpdates) {
        const { error } = await supabase
            .from('products')
            .update({ image_url: update.image_url })
            .eq('internal_id', update.internal_id);
        
        if (error) console.error(`❌ Error updating product ${update.internal_id}:`, error.message);
        else console.log(`✅ Updated product ${update.internal_id} with new image.`);
    }

    // 2. Update Combos to have 'Combos' category
    const { error: comboError } = await supabase
        .from('combos')
        .update({ category: 'Combos' })
        .in('internal_id', ['CB-01', 'CB-02']);

    if (comboError) console.error('❌ Error updating combos category:', comboError.message);
    else console.log('✅ Updated combos category to "Combos".');

    // 3. Flush Cache
    try {
        const baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const apiKey = process.env.RELOAD_API_KEY;
        
        if (apiKey) {
            console.log('🔄 Flushing server cache...');
            // In a real environment, we'd use fetch, but here we can just call the service if we were running in the same process.
            // Since we are a separate script, we'll try to hit the endpoint if the server is up.
            const response = await fetch(`${baseUrl}/api/products/clear-cache`, {
                method: 'POST',
                headers: { 'x-api-key': apiKey }
            });
            if (response.ok) console.log('✅ Cache cleared successfully.');
            else console.warn('⚠️ Cache clear request failed (server might be down).');
        }
    } catch (err) {
        console.warn('⚠️ Could not flush cache via API:', err.message);
    }

    console.log('✨ Database updates completed.');
    process.exit(0);
}

updateDatabase();
