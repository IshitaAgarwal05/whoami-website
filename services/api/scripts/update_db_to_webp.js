const fs = require('fs');
const path = require('path');
const supabase = require('../db/supabaseClient');

async function updateAllToWebP() {
    console.log('🚀 Updating all products and combos to WebP...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized.');
        process.exit(1);
    }

    const baseDir = path.join(process.cwd(), 'public');

    // 1. Update Products
    const { data: products, error: pError } = await supabase.from('products').select('internal_id, image_url');
    if (!pError) {
        for (const product of products) {
            if (!product.image_url || product.image_url.endsWith('.webp')) continue;
            
            const webpRelativePath = product.image_url.replace(/\.[^/.]+$/, "") + ".webp";
            const webpAbsolutePath = path.join(baseDir, webpRelativePath);

            if (fs.existsSync(webpAbsolutePath)) {
                console.log(`✅ Updating product ${product.internal_id} to ${webpRelativePath}`);
                await supabase.from('products').update({ image_url: webpRelativePath }).eq('internal_id', product.internal_id);
            }
        }
    }

    // 2. Update Combos
    const { data: combos, error: cError } = await supabase.from('combos').select('internal_id, image_url');
    if (!cError) {
        for (const combo of combos) {
            if (!combo.image_url || combo.image_url.endsWith('.webp')) continue;
            
            const webpRelativePath = combo.image_url.replace(/\.[^/.]+$/, "") + ".webp";
            const webpAbsolutePath = path.join(baseDir, webpRelativePath);

            if (fs.existsSync(webpAbsolutePath)) {
                console.log(`✅ Updating combo ${combo.internal_id} to ${webpRelativePath}`);
                await supabase.from('combos').update({ image_url: webpRelativePath }).eq('internal_id', combo.internal_id);
            }
        }
    }

    console.log('✨ All possible WebP updates completed.');
    process.exit(0);
}

updateAllToWebP();
