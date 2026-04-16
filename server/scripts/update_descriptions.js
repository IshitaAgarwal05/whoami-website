const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

const updates = [
    { id: "14", desc: "The embodiment of power and precision. This meticulously crafted bust of the Dark Lord of the Sith captures the weight of the Empire. Perfect for those who find order in the darkness." },
    { id: "15", desc: "Carry the currency of the galaxy. A weighted, detailed replica of the coins that fueled trade from Corellia to the Outer Rim. A must-have for every bounty hunter's desk." },
    { id: "16", desc: "A snapshot of the twin sunsets. This miniature landscape captures the rugged beauty of the desert planet where stories began. A silent tribute to hope and destiny." },
    { id: "17", desc: "Capture the magic of the Sorcerer's Stone. These intricate flying keys are frozen in mid-flight, ready to unlock memories of the Boy Who Lived. Enchantment for your bookshelf." },
    { id: "18", desc: "The Elder Wand, the Resurrection Stone, and the Cloak of Invisibility. This geometric symbol represents the ultimate mastery over fate. A subtle, powerful nod to the most ancient magic." },
    { id: "19", desc: "Peer into the wizarding world. This immersive diorama creates a portal between your favorite volumes, illuminating the secret alleys of your imagination." },
    { id: "20", desc: "Step deeper into the magic. A continuation of our immersive booknook series, designed to bring the warmth and mystery of the wizarding world to your personal library." },
    { id: "21", desc: "Carry a piece of your story wherever you go. This minimalist silhouette of the Boy Who Lived is a subtle, durable token for those who still wait for their letter." },
    { id: "22", desc: "A portal to the Upside Down. This minimalist silhouette captures the eerie nostalgia of Hawkins. For those who know that friends don't lie." },
    { id: "23", desc: "A masterpiece of functional art. This 3D-printed balisong features precision-engineered hinges for a smooth, satisfying flip. The perfect tactile companion for your focus." },
    { id: "24", desc: "The evolution of the flip. Version 2 of our signature 3D-printed trainer, refined for balance and durability. Engineered for those who appreciate the mechanics of identity." },
    { id: "25", desc: "A burst of character. The multicoloured edition of our popular butterfly trainer. Vibrant, durable, and designed to stand out on any desk." },
    { id: "26", desc: "Eridian craftsmanship meets human spirit. This figure of Grace represents the ultimate cosmic friendship and the music of the stars. A tribute to scientific curiosity." },
    { id: "27", desc: "The heart of the Eridian-human alliance. A detailed tribute to Rocky, the most resilient engineer in the galaxy. For those who believe that 'we are all made of starstuff'." },
    { id: "28", desc: "The shadow of Orthanc. This miniature diorama captures the dark majesty of Saruman's fortress. A detailed piece for those who appreciate the epic scale of Middle-earth." }
];

async function updateDescriptions() {
    console.log('✍️ Updating 15 product descriptions in Supabase...');

    for (const item of updates) {
        const { error } = await supabase
            .from('products')
            .update({ description: item.desc })
            .eq('internal_id', item.id);

        if (error) {
            console.error(`❌ Failed to update ID ${item.id}:`, error.message);
        } else {
            console.log(`✅ Updated ID ${item.id}`);
        }
    }

    console.log('✨ All descriptions updated successfully!');
    process.exit(0);
}

updateDescriptions();
