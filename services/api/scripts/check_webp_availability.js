const fs = require('fs');
const path = require('path');
const supabase = require('../db/supabaseClient');

async function checkWebP() {
    console.log('🔍 Checking for available WebP images...');

    const { data: products, error } = await supabase
        .from('products')
        .select('internal_id, name, image_url');

    if (error) {
        console.error('❌ Error fetching products:', error.message);
        return;
    }

    const updates = [];

    for (const product of products) {
        if (!product.image_url) continue;

        // Only check if it's not already webp
        if (product.image_url.toLowerCase().endsWith('.webp')) continue;

        const baseDir = path.join(process.cwd(), 'public');
        const relativePath = product.image_url;
        const absolutePath = path.join(baseDir, relativePath);
        
        // Try to find a .webp version in the same folder
        const folder = path.dirname(absolutePath);
        const ext = path.extname(absolutePath);
        const nameWithoutExt = path.basename(absolutePath, ext);
        
        const webpPath = path.join(folder, `${nameWithoutExt}.webp`);
        const relativeWebpPath = path.join(path.dirname(relativePath), `${nameWithoutExt}.webp`);

        if (fs.existsSync(webpPath)) {
            console.log(`✅ Found WebP for ${product.name}: ${relativeWebpPath}`);
            updates.push({ internal_id: product.internal_id, image_url: relativeWebpPath });
        } else {
            // Check if there is ANY webp in that folder that matches the product name partially or is clearly the main one
            try {
                const files = fs.readdirSync(folder);
                const webpFiles = files.filter(f => f.toLowerCase().endsWith('.webp'));
                if (webpFiles.length > 0) {
                    // If there's a webp with the same name (ignoring case or slight diffs)
                    const match = webpFiles.find(f => f.toLowerCase().includes(nameWithoutExt.toLowerCase()));
                    if (match) {
                        const matchedPath = path.join(path.dirname(relativePath), match);
                        console.log(`✅ Found partial match WebP for ${product.name}: ${matchedPath}`);
                        updates.push({ internal_id: product.internal_id, image_url: matchedPath });
                    }
                }
            } catch (e) {
                // Folder might not exist or other issues
            }
        }
    }

    if (updates.length > 0) {
        console.log(`🚀 Updating ${updates.length} products to use WebP...`);
        for (const update of updates) {
            const { error: upError } = await supabase
                .from('products')
                .update({ image_url: update.image_url })
                .eq('internal_id', update.internal_id);
            
            if (upError) console.error(`❌ Error updating ${update.internal_id}:`, upError.message);
        }
        console.log('✅ Update complete.');
    } else {
        console.log('ℹ️ No new WebP images found to update.');
    }
}

checkWebP();
