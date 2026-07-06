const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

const productUpdates = [
    { id: "14", use_case: "Office desks, Star Wars collectors, Pen stand, Dark Side enthusiasts.", 
      desc: "The embodiment of power and precision. This meticulously crafted bust of the Dark Lord of the Sith doubles as a functional pen stand. A commanding presence for any desk where order is paramount." },
    { id: "15", use_case: "Galactic payments, Tacile fidgeting, Cosplay, Secret card storage.", 
      desc: "Carry the currency of the kingdom. This weighted replica features a built-in slot for your credit card—allowing you to Tap & Pay like a true citizen of the Empire. The ultimate fusion of fandom and function." },
    { id: "16", use_case: "Small display shelves, Star Wars enthusiasts, Desert decor." },
    { id: "17", use_case: "Unique wall decor, Harry Potter fans, Enchanted aesthetics." },
    { id: "18", use_case: "Keychains, Subtle fandom expression, Gift for 'Death Eaters'." },
    { id: "19", use_case: "Bookshelf lighting, Collector displays, Library decor." },
    { id: "20", use_case: "Deep library shelves, Magic lovers, Intricate dioramas." },
    { id: "21", use_case: "Everyday carry, Student gifts, Subtle fandom." },
    { id: "22", use_case: "Bedroom decor, Stranger Things fans, Retro 80s vibes." },
    { id: "23", use_case: "Stress relief, Tactical fidgeting, EDC enthusiasts." },
    { id: "24", use_case: "Stress relief, Tactical fidgeting, EDC enthusiasts." },
    { id: "25", use_case: "Stress relief, Tactical fidgeting, EDC enthusiasts." },
    { id: "26", use_case: "Science fiction readers, Office companions, Friendship gifts." },
    { id: "27", use_case: "Engineers, Friendship gifts, Space enthusiasts." },
    { id: "28", use_case: "LOTR collectors, Fantasy dioramas, Gaming room decor." }
];

const comboUpdates = [
    { id: "101", desc: "The First Step into Magic. This essential collection brings the mystery of the Sorting Hat and the charm of Hogwarts to your personal sanctuary." },
    { id: "102", desc: "Rule the Skies. A specialized collection for those who value the thrill of the chase and the legendary speed of the Nimbus 2000." },
    { id: "106", desc: "Hawkins is Closer Than You Think. A chillingly detailed set that merges the eerie elegance of the Demogorgon with our exclusive 80s-inspired wall art." },
    { id: "110", desc: "Secrets of the Sands. Pair the rugged beauty of the twin sunsets with the hard currency of the Empire. Perfect for the galactic wanderer." },
    { id: "112", desc: "The Complete Flow. Own the full evolution of our signature butterfly series (1, 2, and 3). A masterclass in 3D-printed functionality." }
];

async function runUpdate() {
    console.log('🔄 Syncing identities and combo descriptions...');

    // Update Products Use Case and Specific Descriptions
    for (const item of productUpdates) {
        const payload = { use_case: item.use_case };
        if (item.desc) payload.description = item.desc;

        const { error } = await supabase
            .from('products')
            .update(payload)
            .eq('internal_id', item.id);
        
        if (error) console.error(`❌ Product ID ${item.id} update failed:`, error.message);
        else console.log(`✅ Product ID ${item.id} synced.`);
    }

    // Update Combo Descriptions
    for (const item of comboUpdates) {
        const { error } = await supabase
            .from('combos')
            .update({ description: item.desc })
            .eq('internal_id', item.id);
        
        if (error) console.error(`❌ Combo ID ${item.id} update failed:`, error.message);
        else console.log(`✅ Combo ID ${item.id} synced.`);
    }

    console.log('✨ All updates complete!');
    process.exit(0);
}

runUpdate();
