const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

const mapping = {
    'Book Accessories': ["3", "4", "5", "6", "19", "20"],
    'Decor': ["10", "13", "14", "16", "17", "22", "28"],
    'Collectibles': ["1", "2", "7", "8", "9", "11", "12", "15", "18", "21", "23", "24", "25", "26", "27"]
};

async function reorganizeCategories() {
    console.log('🏗️  Reorganizing catalog into Book Accessories, Decor, and Collectibles...');

    for (const [newCategory, ids] of Object.entries(mapping)) {
        console.log(`Updating ${ids.length} items to "${newCategory}"...`);
        
        const { error } = await supabase
            .from('products')
            .update({ category: newCategory })
            .in('internal_id', ids);

        if (error) {
            console.error(`❌ Error updating ${newCategory}:`, error.message);
        } else {
            console.log(`✅ ${newCategory} updated successfully.`);
        }
    }

    console.log('✨ Catalog reorganization complete!');
    process.exit(0);
}

reorganizeCategories();
