const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { createClient } = require('../node_modules/@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log('\n🔄 Fetching all combos from Supabase...\n');

    const { data: combos, error } = await supabase
        .from('combos')
        .select('id, internal_id, name, image_url');

    if (error) {
        console.error('❌ Failed to fetch combos:', error);
        process.exit(1);
    }

    for (const c of combos) {
        if (!c.image_url) continue;

        if (c.image_url.endsWith('/') || !c.image_url.includes('.')) continue;

        const match = c.image_url.match(/^(\/combo\/.+)\/[^/]+$/);
        if (!match) continue;

        const folderUrl = match[1] + '/';

        console.log(`Updating ${c.name}: ${c.image_url} -> ${folderUrl}`);
        
        await supabase
            .from('combos')
            .update({ image_url: folderUrl })
            .eq('id', c.id);
    }

    console.log(`\n🎉 Done combos.\n`);
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
