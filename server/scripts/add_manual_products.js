const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

const manualProducts = [
    {
        internal_id: "29",
        name: "Dragon Eggs",
        description: "A set of three legendary dragon eggs, meticulously crafted to capture the essence of ancient power. These artifacts represent the heritage of the Targaryen bloodline, each with a unique texture reflecting the elements of fire and shadow. Perfect for any Mother of Dragons' desk or a collector of epic sagas.",
        price: 499,
        original_price: 599,
        use_case: "Ideal for Game of Thrones fans, desk decor, or as a symbol of unyielding strength and new beginnings.",
        category: "Game of Thrones",
        material: "PLA Plastic",
        dimensions: "3*3*8 cm",
        weight: "30g",
        image_url: "/products/got-dragon-eggs/draon-eggs.JPG",
        stock: 10
    },
    {
        internal_id: "30",
        name: "GOT Bookmark",
        description: "Never lose your place in the Seven Kingdoms again with this premium GOT-themed bookmark. Featuring intricate sigils and a sleek design, this artifact is built for those whose identity is forged in the stories they read. A subtle yet powerful statement piece for your collection.",
        price: 199,
        original_price: 299,
        use_case: "Perfect for avid readers, fantasy enthusiasts, and collectors of Seven Kingdoms memorabilia.",
        category: "Game of Thrones",
        material: "PLA Plastic",
        dimensions: "4*11*0.3 cm",
        weight: "11g",
        image_url: "/products/got-bm1/got-bm-1.jpeg",
        stock: 10
    },
    {
        internal_id: "31",
        name: "Stranger Things Wall Hanging",
        description: "Bring a piece of the Upside Down into your world with this iconic Stranger Things wall hanging. Designed with a minimalist yet haunting aesthetic, this piece captures the mysterious vibe of Hawkins. A must-have for those who find beauty in the strange and unusual.",
        price: 299,
        original_price: null,
        use_case: "Ideal for bedroom decor, Stranger Things fans, and anyone who appreciates a touch of the mysterious.",
        category: "Stranger Things",
        material: "PLA Plastic",
        dimensions: "10*10*0.5 cm",
        weight: "17g",
        image_url: "/products/st-wh/st-wh.JPG",
        stock: 10
    },
    {
        internal_id: "32",
        name: "Sorting Hat Keychain",
        description: "Let the Sorting Hat guide your daily adventures. This compact keychain artifact is a subtle reminder of where you belong in the wizarding world. Meticulously detailed to represent the ancient hat's wisdom and personality, it's a small piece of magic for your keys.",
        price: 79,
        original_price: 99,
        use_case: "Perfect for school bags, car keys, or as a thoughtful gift for a fellow Potterhead.",
        category: "Harry Potter",
        material: "PLA Plastic",
        dimensions: "4*7*0.3 cm",
        weight: "6g",
        image_url: "/products/sorting-hat-kc/sorting-hat-kc.jpeg",
        stock: 10
    }
];

async function addProducts() {
    console.log('🚀 Adding 4 new manual products to Supabase...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized. Check your .env setup.');
        process.exit(1);
    }

    const { data, error } = await supabase
        .from('products')
        .insert(manualProducts);

    if (error) {
        console.error('❌ Error adding products:', error.message);
        process.exit(1);
    }

    console.log('✅ Successfully added Dragon Eggs, GOT Bookmark, ST Wall Hanging, and Sorting Hat Keychain.');
    process.exit(0);
}

addProducts();
