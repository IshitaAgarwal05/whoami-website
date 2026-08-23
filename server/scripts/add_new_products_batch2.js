const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

async function addNewProducts() {
    console.log('🚀 Adding new products to the database...');

    if (!supabase) {
        console.error('❌ Supabase client not initialized.');
        process.exit(1);
    }

    const newProducts = [
        {
            internal_id: "35",
            name: "Stranger Things Keychain",
            description: "Dive into the Upside Down with this exclusive Stranger Things Keychain! Featuring iconic imagery from your favorite supernatural series, this high-quality keychain ensures your keys are as stylish as they are secure.",
            price: 199,
            original_price: 299,
            use_case: "Best for Stranger Things fans, securing keys, or adding a pop culture touch to your backpack.",
            category: "Keychain",
            material: "PLA Plastic",
            dimensions: "4*4 cm",
            weight: "10g",
            image_url: "/products/st-kc/st.jpeg",
            stock: 10
        },
        {
            internal_id: "36",
            name: "Toothless Keychain",
            description: "Carry a piece of the Night Fury with you everywhere! This adorable Toothless Keychain captures the charm of the beloved dragon. Durable and lightweight, it's the perfect companion for your daily adventures.",
            price: 199,
            original_price: 299,
            use_case: "Best for How to Train Your Dragon enthusiasts, gifting to loved ones, or accessorizing everyday bags.",
            category: "Keychain",
            material: "PLA Plastic",
            dimensions: "4.5*4.5 cm",
            weight: "12g",
            image_url: "/products/toothless-kc/toothless.jpeg",
            stock: 10
        },
        {
            internal_id: "37",
            name: "Duck Charm",
            description: "Add a splash of cuteness to your accessories with this delightful Duck Charm. Its vibrant details and playful design make it an instant favorite for personalizing your belongings.",
            price: 99,
            original_price: 149,
            use_case: "Best for charm bracelets, zipper pulls, or decorating your pencil cases and pouches.",
            category: "Charms",
            material: "PLA Plastic",
            dimensions: "2*2 cm",
            weight: "5g",
            image_url: "/products/charms/duck/WhatsApp Image 2026-06-27 at 19.43.53.jpeg",
            stock: 10
        },
        {
            internal_id: "38",
            name: "Heart Charm",
            description: "Show some love with this elegant Heart Charm. A timeless design crafted for durability, it adds a touch of affection and style wherever it's attached.",
            price: 99,
            original_price: 149,
            use_case: "Best for gifting to a special someone, customizing keyrings, or adding to your jewelry collection.",
            category: "Charms",
            material: "PLA Plastic",
            dimensions: "2.5*2.5 cm",
            weight: "5g",
            image_url: "/products/charms/heart/WhatsApp Image 2026-06-27 at 19.43.52.jpeg",
            stock: 10
        },
        {
            internal_id: "39",
            name: "Letter Charm",
            description: "Personalize your style with this sleek Letter Charm. Whether it's your initial or a loved one's, this crafted charm brings a unique, customized feel to any item.",
            price: 99,
            original_price: 149,
            use_case: "Best for personalizing backpacks, creating custom charm bracelets, or as a thoughtful personalized gift.",
            category: "Charms",
            material: "PLA Plastic",
            dimensions: "2*2 cm",
            weight: "5g",
            image_url: "/products/charms/letter/WhatsApp Image 2026-06-27 at 19.43.51.jpeg",
            stock: 10
        },
        {
            internal_id: "40",
            name: "Toothless Charm",
            description: "A miniature Night Fury just for you! This Toothless Charm is incredibly detailed and perfectly sized to add a magical, draconic touch to your everyday gear.",
            price: 99,
            original_price: 149,
            use_case: "Best for dragon lovers, decorating lanyards, or pairing with the Toothless Keychain for a complete set.",
            category: "Charms",
            material: "PLA Plastic",
            dimensions: "2.5*2.5 cm",
            weight: "5g",
            image_url: "/products/charms/toothless/WhatsApp Image 2026-06-27 at 19.43.08.jpeg",
            stock: 10
        }
    ];

    const { error } = await supabase
        .from('products')
        .insert(newProducts);

    if (error) {
        console.error('❌ Error adding products:', error.message);
        process.exit(1);
    }

    console.log('✅ Successfully added all new products.');
    process.exit(0);
}

addNewProducts();
