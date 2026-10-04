/**
 * MIGRATION: Update all product image_url values in Supabase
 * from file paths to folder paths.
 *
 * Before: /products/thing/thing.webp
 * After:  /products/thing/
 *
 * Run from WhoAmI_Website root:
 *   node server/scripts/migrate_image_urls_to_folders.js
 */

const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { createClient } = require('../node_modules/@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const publicDir = path.join(__dirname, '../../public');

async function run() {
    console.log('\n🔄 Fetching all products from Supabase...\n');

    const { data: products, error } = await supabase
        .from('products')
        .select('id, internal_id, name, image_url');

    if (error) {
        console.error('❌ Failed to fetch products:', error);
        process.exit(1);
    }

    const updates = [];
    const skipped = [];

    for (const p of products) {
        if (!p.image_url) {
            skipped.push({ name: p.name, reason: 'null image_url' });
            continue;
        }

        // Already a folder path
        if (p.image_url.endsWith('/') || !p.image_url.includes('.')) {
            skipped.push({ name: p.name, reason: 'already a folder path' });
            continue;
        }

        // Extract folder from file path: "/products/thing/thing.webp" -> "/products/thing/"
        const match = p.image_url.match(/^(\/products\/.+)\/[^/]+$/);
        if (!match) {
            skipped.push({ name: p.name, reason: `unrecognized format: ${p.image_url}` });
            continue;
        }

        const folderUrl = match[1] + '/';

        // Verify the folder exists on disk
        const folderPath = path.join(publicDir, ...folderUrl.split('/').filter(Boolean));
        if (!fs.existsSync(folderPath)) {
            skipped.push({ name: p.name, reason: `folder not found on disk: ${folderUrl}` });
            continue;
        }

        updates.push({ id: p.id, name: p.name, old: p.image_url, new: folderUrl });
    }

    console.log(`📋 Products to update: ${updates.length}`);
    console.log(`⏩ Products to skip:   ${skipped.length}\n`);

    if (skipped.length > 0) {
        console.log('Skipped:');
        skipped.forEach(s => console.log(`  - ${s.name}: ${s.reason}`));
        console.log('');
    }

    if (updates.length === 0) {
        console.log('✅ Nothing to update. All products already use folder paths.');
        process.exit(0);
    }

    console.log('Changes to apply:');
    updates.forEach(u => console.log(`  ✏️  ${u.name.padEnd(35)} ${u.old} -> ${u.new}`));
    console.log('');

    // Apply updates
    let successCount = 0;
    let failCount = 0;

    for (const update of updates) {
        const { error: updateError } = await supabase
            .from('products')
            .update({ image_url: update.new, updated_at: new Date().toISOString() })
            .eq('id', update.id);

        if (updateError) {
            console.error(`  ❌ Failed to update "${update.name}":`, updateError.message);
            failCount++;
        } else {
            console.log(`  ✅ Updated "${update.name}"`);
            successCount++;
        }
    }

    console.log(`\n🎉 Done! ${successCount} updated, ${failCount} failed.\n`);
    process.exit(failCount > 0 ? 1 : 0);
}

run().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
