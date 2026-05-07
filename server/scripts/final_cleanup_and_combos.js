const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

async function runFinalUpdates() {
    console.log('🚀 Starting final updates and merge...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized.');
        process.exit(1);
    }

    // 1. Delete redundant "Wall Art" (Internal ID: 22)
    console.log('🧹 Merging Stranger Things Wall Art into Wall Hanging...');
    const { error: delError } = await supabase
        .from('products')
        .delete()
        .eq('internal_id', '22');

    if (delError) console.error('❌ Error deleting duplicate wall art:', delError.message);

    // 2. Update Stranger Things Wall Hanging (Internal ID: 31) with correct specs
    console.log('✨ Updating Stranger Things Wall Hanging specs...');
    const { error: stError } = await supabase
        .from('products')
        .update({
            name: "Stranger Things Wall Hanging",
            weight: "17g",
            price: 299,
            original_price: null,
            dimensions: "10*10*0.5 cm",
            image_url: "/products/st-wh/st-wh.JPG",
            category: "Decor"
        })
        .eq('internal_id', '31');

    if (stError) console.error('❌ Error updating ST Wall Hanging:', stError.message);

    // 3. Update GOT Bookmark dimensions (Internal ID: 30) - Just to be sure
    console.log('📏 Ensuring GOT Bookmark dimensions are correct...');
    await supabase
        .from('products')
        .update({ dimensions: "16*6*0.3 cm" })
        .eq('internal_id', '30');

    // 4. Update Combos (Upsert them with correct IDs)
    console.log('📦 Adding/Updating combos...');
    const combos = [
        {
            internal_id: "CB-01",
            name: "Hogwarts Reader Pack",
            description: "The ultimate collection for the dedicated Potterhead. Includes a Golden Snitch book holder, two unique Harry Potter bookmarks (Hogwarts & Castle), and a Deathly Hallows artifact piece. Everything you need to transform your reading experience into a magical journey.",
            price: 699,
            original_price: 849,
            image_url: "/combo/hp-1/hp-1.JPG",
            items: ["11", "3", "4", "18"],
            is_active: true
        },
        {
            internal_id: "CB-02",
            name: "Stranger Things Identity Pack",
            description: "Pure identity for your bookshelf. This pack brings the Upside Down to your room with two iconic Stranger Things bookmarks (Max & Demogorgon) and a custom themed wall art piece. A perfect gift for anyone who knows that friends don't lie.",
            price: 599,
            original_price: 749,
            image_url: "/combo/st-1/st-1.JPG",
            items: ["2", "13", "31"],
            is_active: true
        }
    ];

    for (const combo of combos) {
        const { error: comboError } = await supabase
            .from('combos')
            .upsert(combo, { onConflict: 'internal_id' });
        
        if (comboError) console.error(`❌ Error upserting combo ${combo.name}:`, comboError.message);
    }

    console.log('✅ All updates, merges, and combos completed successfully.');
    process.exit(0);
}

runFinalUpdates();
