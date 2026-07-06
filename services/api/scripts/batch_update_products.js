const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

async function runUpdates() {
    console.log('🚀 Starting batch updates...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized.');
        process.exit(1);
    }

    // 1. Update GOT Bookmark dimensions (Internal ID: 30)
    console.log('📏 Updating GOT Bookmark dimensions...');
    const { error: dimError } = await supabase
        .from('products')
        .update({ dimensions: "16*6*0.3 cm" })
        .eq('internal_id', '30');

    if (dimError) console.error('❌ Error updating dimensions:', dimError.message);

    // 2. Reorganize categories
    console.log('📁 Reorganizing categories...');
    
    const categoryMappings = [
        { old: 'Game of Thrones', new: 'Decor', ids: ['29'] },
        { old: 'Game of Thrones', new: 'Book Accessories', ids: ['30'] },
        { old: 'Stranger Things', new: 'Decor', ids: ['22', '31'] },
        { old: 'Harry Potter', new: 'Decor', ids: ['17', '19', '20'] },
        { old: 'Harry Potter', new: 'Keychains', ids: ['21', '32'] },
        { old: 'Harry Potter', new: 'Collectibles', ids: ['18', '9'] },
        { old: 'Star Wars', new: 'Decor', ids: ['14', '16'] },
        { old: 'Star Wars', new: 'Collectibles', ids: ['15'] }
    ];

    for (const mapping of categoryMappings) {
        const { error: catError } = await supabase
            .from('products')
            .update({ category: mapping.new })
            .in('internal_id', mapping.ids);
        
        if (catError) console.error(`❌ Error updating category for ${mapping.old} -> ${mapping.new}:`, catError.message);
    }

    // 3. Add Combos
    console.log('📦 Adding combos...');
    const combos = [
        {
            internal_id: "CB-01",
            name: "Hogwarts Reader Pack",
            description: "The ultimate collection for the dedicated Potterhead. Includes a Golden Snitch book holder, two unique Harry Potter bookmarks, and a Deathly Hallows keychain. Everything you need to transform your reading experience into a magical journey.",
            price: 699,
            original_price: 849,
            image_url: "/combo/hp-1/hp-1.JPG",
            items: ["snitch-bh", "hp-bm1", "hp-bm2", "21"], // I'll assume these are the correct IDs based on common names
            is_active: true
        },
        {
            internal_id: "CB-02",
            name: "Stranger Things Identity Pack",
            description: "Pure identity for your bookshelf. This pack brings the Upside Down to your world with two iconic Stranger Things bookmarks and a custom themed wall art piece. A perfect gift for anyone who knows that friends don't lie.",
            price: 599,
            original_price: 749,
            image_url: "/combo/st-1/st-1.JPG",
            items: ["st-bm1", "st-bm2", "31"],
            is_active: true
        }
    ];

    const { error: comboError } = await supabase
        .from('combos')
        .insert(combos);

    if (comboError) console.error('❌ Error adding combos:', comboError.message);

    console.log('✅ Batch updates completed.');
    process.exit(0);
}

runUpdates();
