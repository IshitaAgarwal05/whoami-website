const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

async function addGrogu() {
    console.log('🚀 Adding Grogu to the database...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized.');
        process.exit(1);
    }

    const grogu = {
        internal_id: "33",
        name: "Grogu",
        description: "The Child, known to many as Grogu, is a powerful force-sensitive being. This meticulously crafted artifact captures his curious and calm essence. A symbol of hope and the bond between protector and ward, perfect for any Star Wars fan's collection.",
        price: 299,
        original_price: 399,
        use_case: "Ideal for Star Wars fans, desk decor, or as a thoughtful gift for a fellow galactic traveler.",
        category: "Decor",
        material: "PLA Plastic",
        dimensions: "4.5*5*3.5 cm",
        weight: "15g",
        image_url: "/products/grogu/grogu-1.jpeg",
        stock: 10
    };

    const { error } = await supabase
        .from('products')
        .insert([grogu]);

    if (error) {
        console.error('❌ Error adding Grogu:', error.message);
        process.exit(1);
    }

    console.log('✅ Successfully added Grogu.');
    process.exit(0);
}

addGrogu();
