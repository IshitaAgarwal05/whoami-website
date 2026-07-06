const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

async function addHPBookmark() {
    console.log('🚀 Adding new HP Bookmark to the database...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized.');
        process.exit(1);
    }

    const bookmark = {
        internal_id: "34",
        name: "Shaded Hogwarts Bookmark",
        description: "A sophisticated grey-white-black shaded Harry Potter themed bookmark. Designed for the minimalist witch or wizard who appreciates a subtle touch of magic in their daily reading. This premium artifact is built for those whose identity is forged in the stories they read.",
        price: 199,
        original_price: 299,
        use_case: "Perfect for avid readers, fantasy enthusiasts, and collectors of magical artifacts.",
        category: "Book Accessories",
        material: "PLA Plastic",
        dimensions: "16*6*0.3 cm",
        weight: "11g",
        image_url: "/products/hp-bm3/hp-bm3.webp",
        stock: 10
    };

    const { error } = await supabase
        .from('products')
        .insert([bookmark]);

    if (error) {
        console.error('❌ Error adding Bookmark:', error.message);
        process.exit(1);
    }

    console.log('✅ Successfully added Shaded Hogwarts Bookmark.');
    process.exit(0);
}

addHPBookmark();
