const fs = require('fs');
const path = require('path');
const supabase = require('../db/supabaseClient');

async function fixMissingImages() {
    console.log('🚀 Checking products and combos for missing images...');

    const baseDir = path.join(process.cwd(), 'public');

    const { data: products } = await supabase.from('products').select('internal_id, image_url');
    for (const item of products) {
        if (item.image_url && item.image_url !== '/products/placeholder.webp') {
            const absolutePath = path.join(baseDir, item.image_url);
            if (!fs.existsSync(absolutePath)) {
                console.log(`❌ Product ${item.internal_id} image missing on disk: ${item.image_url}`);
                await supabase.from('products').update({ image_url: '/products/placeholder.webp' }).eq('internal_id', item.internal_id);
            }
        }
    }

    const { data: combos } = await supabase.from('combos').select('internal_id, image_url');
    for (const item of combos) {
        if (item.image_url && item.image_url !== '/products/placeholder.webp' && item.image_url !== '/combo/placeholder.webp') {
            const absolutePath = path.join(baseDir, item.image_url);
            if (!fs.existsSync(absolutePath)) {
                console.log(`❌ Combo ${item.internal_id} image missing on disk: ${item.image_url}`);
                await supabase.from('combos').update({ image_url: '/products/placeholder.webp' }).eq('internal_id', item.internal_id);
            }
        }
    }

    console.log('✨ Database image links corrected.');
    process.exit(0);
}

fixMissingImages();
