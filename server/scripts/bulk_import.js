const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

const newProducts = [
    // STAR WARS
    { internal_id: "14", name: "Darth Vader", price: 599, original_price: 799, weight: "73g", material: "PLA", category: "Star Wars" },
    { internal_id: "15", name: "Imperial Credit", price: 299, original_price: 399, weight: "37g", material: "PLA", category: "Star Wars" },
    { internal_id: "16", name: "Tatooine Diorama", price: 799, original_price: 999, weight: "107g", material: "PLA", category: "Star Wars" },
    // HARRY POTTER
    { internal_id: "17", name: "Hanging Keys (Set of 3)", price: 150, original_price: 200, weight: "15g", material: "PLA", category: "Harry Potter" },
    { internal_id: "18", name: "Deathly Hallows Piece", price: 149, original_price: null, weight: "12g", material: "PLA", category: "Harry Potter" },
    { internal_id: "19", name: "Booknook 1", price: 1299, original_price: 1499, weight: "194g", material: "PLA", category: "Harry Potter" },
    { internal_id: "20", name: "Booknook 2", price: 899, original_price: 1199, weight: "121g", material: "PLA", category: "Harry Potter" },
    { internal_id: "21", name: "HP Face Keychain 1", price: 79, original_price: 99, weight: "6.25g", material: "PLA", category: "Harry Potter" },
    // STRANGER THINGS
    { internal_id: "22", name: "Wall Art", price: 299, original_price: null, weight: "17g", material: "PLA", category: "Stranger Things" },
    // MISC
    { internal_id: "23", name: "Butterfly Knife 1", price: 299, original_price: 399, weight: "25g", material: "PLA", category: "Misc" },
    { internal_id: "24", name: "Butterfly Knife 2", price: 249, original_price: 299, weight: "25g", material: "PLA", category: "Misc" },
    { internal_id: "25", name: "Butterfly Knife 3 (Multicolour)", price: 399, original_price: 499, weight: "40g", material: "PLA", category: "Misc" },
    // HAIL MARY
    { internal_id: "26", name: "Grace", price: 199, original_price: 299, weight: "15g", material: "PLA", category: "Hail Mary" },
    { internal_id: "27", name: "Rocky", price: 499, original_price: 599, weight: "47g", material: "PLA", category: "Hail Mary" },
    // LORD OF THE RINGS
    { internal_id: "28", name: "Diorama Isengard", price: 799, original_price: 999, weight: "121.5g", material: "PLA", category: "Lord of The Rings" }
];

async function runImport() {
    console.log('🚀 Starting bulk import of 15 new products...');

    // Prepare data for Supabase
    const preparedData = newProducts.map(p => ({
        ...p,
        description: "Placeholder description for " + p.name + ". Coming soon!",
        image_url: "/products/placeholder.webp", // Placeholder as requested
        stock: 10,
        tags: []
    }));

    const { data, error } = await supabase
        .from('products')
        .upsert(preparedData, { onConflict: 'internal_id' });

    if (error) {
        console.error('❌ Error during import:', error.message);
        process.exit(1);
    }

    console.log('✅ Successfully imported 15 products into Supabase.');
    process.exit(0);
}

runImport();
